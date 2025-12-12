import * as React from "react";

export const OrderConfirmationEmail = ({ orderDetails, userEmail }) => {
  const {
    orderId,
    totalAmount,
    createdAt,
    fullName,
    phone,
    line1,
    line2,
    city,
    state,
    postalCode,
    items,
  } = orderDetails;

  const formattedDate = new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#000000",
          padding: "30px 20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#ffffff", margin: 0, fontSize: "28px" }}>
          FastBite
        </h1>
      </div>

      {/* Success Message */}
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <div
          style={{
            width: "60px",
            height: "60px",
            backgroundColor: "#22c55e",
            borderRadius: "50%",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#ffffff", fontSize: "30px" }}>✓</span>
        </div>
        <h2 style={{ color: "#000000", margin: "0 0 10px 0" }}>
          Order Confirmed!
        </h2>
        <p style={{ color: "#666666", margin: 0 }}>
          Thank you for your order, {fullName}
        </p>
      </div>

      {/* Order Details */}
      <div style={{ padding: "0 20px 20px" }}>
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "8px 0",
                    color: "#666666",
                    fontSize: "14px",
                  }}
                >
                  Order ID:
                </td>
                <td
                  style={{
                    padding: "8px 0",
                    color: "#000000",
                    fontWeight: "bold",
                    textAlign: "right",
                    fontSize: "14px",
                  }}
                >
                  #{orderId}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "8px 0",
                    color: "#666666",
                    fontSize: "14px",
                  }}
                >
                  Order Date:
                </td>
                <td
                  style={{
                    padding: "8px 0",
                    color: "#000000",
                    textAlign: "right",
                    fontSize: "14px",
                  }}
                >
                  {formattedDate}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Items */}
        <h3 style={{ color: "#000000", marginBottom: "15px" }}>Order Items</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e5e5" }}>
              <th
                style={{
                  padding: "12px 0",
                  textAlign: "left",
                  color: "#666666",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                ITEM
              </th>
              <th
                style={{
                  padding: "12px 0",
                  textAlign: "center",
                  color: "#666666",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                QTY
              </th>
              <th
                style={{
                  padding: "12px 0",
                  textAlign: "right",
                  color: "#666666",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                PRICE
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td
                  style={{
                    padding: "15px 0",
                    color: "#000000",
                    fontSize: "14px",
                  }}
                >
                  {item.product_name}
                </td>
                <td
                  style={{
                    padding: "15px 0",
                    color: "#666666",
                    textAlign: "center",
                    fontSize: "14px",
                  }}
                >
                  {item.quantity}
                </td>
                <td
                  style={{
                    padding: "15px 0",
                    color: "#000000",
                    textAlign: "right",
                    fontSize: "14px",
                  }}
                >
                  ₹{item.item_total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "30px",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "8px 0",
                    color: "#000000",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  Total Amount:
                </td>
                <td
                  style={{
                    padding: "8px 0",
                    color: "#000000",
                    fontSize: "20px",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  ₹{totalAmount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Delivery Address */}
        <h3 style={{ color: "#000000", marginBottom: "15px" }}>
          Delivery Address
        </h3>
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "30px",
          }}
        >
          <p
            style={{ margin: "0 0 5px 0", color: "#000000", fontWeight: "600" }}
          >
            {fullName}
          </p>
          <p
            style={{ margin: "0 0 5px 0", color: "#666666", fontSize: "14px" }}
          >
            {line1}
          </p>
          {line2 && (
            <p
              style={{
                margin: "0 0 5px 0",
                color: "#666666",
                fontSize: "14px",
              }}
            >
              {line2}
            </p>
          )}
          <p
            style={{ margin: "0 0 5px 0", color: "#666666", fontSize: "14px" }}
          >
            {city}, {state} {postalCode}
          </p>
          <p style={{ margin: "0", color: "#666666", fontSize: "14px" }}>
            Phone: {phone}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "30px 20px",
          textAlign: "center",
          borderTop: "1px solid #e5e5e5",
        }}
      >
        <p style={{ margin: "0 0 10px 0", color: "#666666", fontSize: "14px" }}>
          Need help? Contact us at href="mailto:joshijigisha8569@gmail.com"
          style={{ color: "#000000", textDecoration: "none" }}
          <a>joshijigisha8569@gmail.com</a>
        </p>
        <p style={{ margin: 0, color: "#999999", fontSize: "12px" }}>
          © 2024 FastBite. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmationEmail;
