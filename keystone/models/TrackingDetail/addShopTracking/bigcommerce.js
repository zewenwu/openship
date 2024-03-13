export async function bigcommerce({ order, trackingCompany, trackingNumber }) {
  const shippingResponse = await fetch(
    `https://api.bigcommerce.com/stores/${order.shop.domain}/v2/orders/${order.orderId}/shipping_addresses`,
    {
      headers: {
        "X-Auth-Token": order.shop.accessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "GET",
    }
  );

  const shippingAddresses = await shippingResponse.json();

  console.log({ shippingAddresses });

  const orderProductsResponse = await fetch(
    `https://api.bigcommerce.com/stores/${order.shop.domain}/v2/orders/${order.orderId}/products`,
    {
      headers: {
        "X-Auth-Token": order.shop.accessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "GET",
    }
  );

  const orderProducts = await orderProductsResponse.json();

  console.log({ orderProducts });

  const shipmentResponse = await fetch(
    `https://api.bigcommerce.com/stores/${order.shop.domain}/v2/orders/${order.orderId}/shipments`,
    {
      headers: {
        "X-Auth-Token": order.shop.accessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        order_address_id: shippingAddresses[0].id,
        tracking_number: trackingNumber,
        shipping_method: "Standard",
        tracking_carrier: "usps",
        items: orderProducts.map(({ id, quantity }) => ({
          order_product_id: id,
          quantity,
        })),
      }),
    }
  );

  // console.log(fulfillResponse);

  const shipments = await shipmentResponse.json();

  // const { shipment } = convertXmlToJson(shipments);

  console.log({ shipments });

  if (shipments[0]?.status === 400) {
    return { error: shipments[0]?.message };
  }

  return { fulfillment: { id: shipments.id } };

  // if (fulErrors?.length > 0) {
  //   const orderResponse = await fetch(
  //     `https://api.bigcommerce.com/stores/${order.shop.domain}/v3/orders/${order.orderId}`,
  //     {
  //       headers: {
  //         "Content-Type": "application/json",
  //         "X-Auth-Token": order.shop.accessToken,
  //       },
  //       method: "GET",
  //     }
  //   );

  //   const {
  //     data: {
  //       data: { shipments },
  //     },
  //     errors: orderErrors,
  //   } = await orderResponse.json();

  //   if (shipments?.length > 0) {
  //     const fulfillUpdateResponse = await fetch(
  //       `https://api.bigcommerce.com/stores/${order.shop.domain}/v2/shipments/${shipments[0].id}`,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           "X-Auth-Token": order.shop.accessToken,
  //         },
  //         method: "PUT",
  //         body: JSON.stringify({
  //           tracking_numbers: [
  //             trackingNumber,
  //             ...shipments[0].tracking_numbers,
  //           ],
  //           tracking_url: shipments[0].tracking_url,
  //           carrier: trackingCompany,
  //         }),
  //       }
  //     );

  //     const {
  //       data: {
  //         data: { id: fulfillmentId },
  //       },
  //       errors: updateErrors,
  //     } = await fulfillUpdateResponse.json();
  //     return { fulfillment: { id: fulfillmentId }, userErrors: updateErrors };
  //   }
  // } else {
  //   return { fulfillment: { id: fulfillment.id }, userErrors: [] };
  // }
}
