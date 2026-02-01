
import axios from 'axios';
import config from '../config';

let shiprocketToken: string | null = null;
let tokenExpiry: number | null = null;

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

const getAuthToken = async () => {
  const now = Date.now();
  // Shiprocket tokens last 240 hours (10 days).
  if (shiprocketToken && tokenExpiry && now < tokenExpiry - 3600000) {
    return shiprocketToken;
  }

  try {
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email: config.shiprocket.email,
      password: config.shiprocket.password,
    });

    shiprocketToken = response.data.token;
    tokenExpiry = now + 9 * 24 * 60 * 60 * 1000; 
    
    return shiprocketToken;
  } catch (error: any) {
    console.error('Shiprocket Login Failed:', error.response?.data || error.message);
    return null;
  }
};

export const createShiprocketOrder = async (order: any, user: any) => {
  const token = await getAuthToken();
  if (!token) {
    console.warn('Skipping Shiprocket order creation: No Auth Token');
    return null;
  }

  // Safety check
  if (!order.items || !Array.isArray(order.items)) {
      console.error('Shiprocket Order Creation Failed: Order items missing');
      return null;
  }

  const date = new Date(order.createdAt);
  const formattedDate = date.toISOString().slice(0, 10) + ' ' + date.toTimeString().slice(0, 5);

  const fullName = user.name || "Guest User";
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "User";

  // Address Logic:
  // Only append city/pin if the address is suspiciously short (< 10 chars) to pass validation.
  // Otherwise, trust the user's input but remove special chars.
  let rawAddress = order.shippingAddress || "";
  rawAddress = rawAddress.replace(/[^\w\s,.-]/g, ''); // Remove special chars like :, #, /

  let finalAddress = rawAddress;
  if (rawAddress.length < 10) {
      finalAddress = `${rawAddress}, ${order.city} ${order.pincode}`;
  }
  // Ensure we don't exceed max length
  finalAddress = finalAddress.substring(0, 150);

  const totalWeight = order.items.reduce((sum: number, item: any) => {
    return sum + (item.quantity * 0.5); 
  }, 0);

  // Payload Construction: Explicitly mirroring billing to shipping
  const payload = {
    order_id: order.id,
    order_date: formattedDate,
    pickup_location: config.shiprocket.pickupLocation || "Primary", // Configurable from .env

    // Billing
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: finalAddress,
    billing_city: order.city || "City",
    billing_pincode: order.pincode || "000000",
    billing_state: order.state || "State",
    billing_country: "India",
    billing_email: user.email || "noemail@example.com",
    billing_phone: order.phone || "9999999999",
    
    // Shipping - Explicitly Set
    shipping_is_billing: false,
    shipping_customer_name: firstName,
    shipping_last_name: lastName,
    shipping_address: finalAddress,
    shipping_city: order.city || "City",
    shipping_pincode: order.pincode || "000000",
    shipping_state: order.state || "State",
    shipping_country: "India",
    shipping_email: user.email || "noemail@example.com",
    shipping_phone: order.phone || "9999999999",
    
    order_items: order.items.map((item: any) => ({
      name: item.product?.name || "Product", 
      sku: item.product?.sku || item.product?.id || "SKU",
      units: parseInt(item.quantity),
      selling_price: parseFloat(item.price),
      discount: 0,
      tax: 0,
      hsn: 8542 
    })),
    payment_method: "Prepaid",
    sub_total: parseFloat(order.totalAmount),
    length: 10, 
    breadth: 10,
    height: 10,
    weight: totalWeight
  };

  try {
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Shiprocket Order Created Successfully: ${response.data.order_id}`);
    return {
      shiprocketOrderId: response.data.order_id,
      shiprocketShipmentId: response.data.shipment_id,
      awbCode: response.data.awb_code
    };
  } catch (error: any) {
    const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error('Shiprocket Order Creation Error:', errorMsg);
    console.error('Failed Payload:', JSON.stringify(payload));
    return null; 
  }
};


// --- Serviceability Check ---
export const getEstimatedDelivery = async (deliveryPincode: string, weight: number = 0.5) => {
    // Fallback date (Current date + 5 days)
    const getFallbackDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + 5);
        return d.toDateString();
    };

    const token = await getAuthToken();
    if (!token) return getFallbackDate();

    // Note: pickup_postcode is ideally from your account, but for estimation, 
    // we use a common metro pincode (e.g., Delhi) if not strictly enforced, 
    // or try to use the user's input if the API allows. 
    // Shiprocket API requires a valid pickup_postcode. 
    // If you have a specific warehouse pincode, replace '110001' below.
    const pickupPincode = '411041'; // Example: Pune/Mumbai hub. Adjust to your actual warehouse pin.

    try {
        const response = await axios.get(`${SHIPROCKET_BASE_URL}/courier/serviceability`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: {
                pickup_postcode: pickupPincode,
                delivery_postcode: deliveryPincode,
                weight: weight,
                cod: 0 // Prepaid
            }
        });

        // Shiprocket returns a list of couriers. We pick the fastest ETD.
        const couriers = response.data?.data?.available_courier_companies;
        
        if (couriers && couriers.length > 0) {
            // Find the courier with the 'etd' string (Estimated Time of Delivery)
            // Or usually, just take the first recommended one
            const bestOption = couriers[0];
            return bestOption.etd; // Usually returns a date string like "2024-05-20"
        }
        
        return getFallbackDate();

    } catch (error: any) {
        // If 404 (Pincode not found) or 422, return fallback
        // console.warn("Shiprocket serviceability check failed, using fallback.", error.message);
        return getFallbackDate();
    }
};
