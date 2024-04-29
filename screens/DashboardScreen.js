import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { db, auth } from "../firebase";
import { Picker } from "@react-native-picker/picker";

const DashboardScreen = () => {
  const [salesData, setSalesData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [topCustomersData, setTopCustomersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("31");

  useEffect(() => {
    fetchSalesData(timeRange);
    fetchTopProducts();
    fetchTopCustomers();
  }, [timeRange]);

  const fetchSalesData = async (range) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Current user not found.");
      }

      console.log("Fetching user data...");
      const userDoc = await db.collection("users").doc(currentUser.uid).get();
      const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

      if (!companyID) {
        throw new Error("Company ID not found for the current user.");
      }

      console.log("Fetching sales data...");
      const endDate = new Date();
      const startDate = new Date();

      switch (range) {
        case "31":
          startDate.setDate(endDate.getDate() - 31);
          break;
        case "183":
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case "365":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case "730":
          startDate.setFullYear(endDate.getFullYear() - 2);
          break;
        case "1095":
          startDate.setFullYear(endDate.getFullYear() - 3);
          break;
        default:
          startDate.setDate(endDate.getDate() - 31);
      }

      const salesSnapshot = await db
        .collection("invoices")
        .where("companyID", "==", companyID)
        .where("date", ">=", startDate)
        .where("date", "<=", endDate)
        .orderBy("date")
        .get();

      const sales = {};
      salesSnapshot.forEach((doc) => {
        const saleData = doc.data();
        const date = saleData.date.toDate().toLocaleDateString();
        const total = parseFloat(saleData.total);
        if (!isNaN(total)) {
          if (date in sales) {
            sales[date] += total;
          } else {
            sales[date] = total;
          }
        }
      });

      console.log("Sales data fetched:", sales);
      const formattedSalesData = Object.entries(sales).map(([date, total]) => ({
        date,
        total: total.toFixed(2),
      }));

      console.log("Formatted sales data:", formattedSalesData);
      setSalesData(formattedSalesData);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setError("Failed to fetch sales data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Current user not found.");
      }

      console.log("Fetching user data...");
      const userDoc = await db.collection("users").doc(currentUser.uid).get();
      const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

      if (!companyID) {
        throw new Error("Company ID not found for the current user.");
      }

      console.log("Fetching top selling products...");
      const invoicesSnapshot = await db
        .collection("invoices")
        .where("companyID", "==", companyID)
        .get();

      const productQuantityMap = new Map();
      invoicesSnapshot.forEach((doc) => {
        const productList = doc.data().productList;
        productList.forEach((product) => {
          const productName = product.name;
          const quantity = parseInt(product.quantity);
          if (!productQuantityMap.has(productName)) {
            productQuantityMap.set(productName, quantity);
          } else {
            productQuantityMap.set(
              productName,
              productQuantityMap.get(productName) + quantity
            );
          }
        });
      });

      const topProducts = [...productQuantityMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([productName, quantity]) => ({ productName, quantity }));

      console.log("Top selling products data fetched:", topProducts);
      setTopProductsData(topProducts);
    } catch (error) {
      console.error("Error fetching top selling products:", error);
      setError("Failed to fetch top selling products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopCustomers = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Current user not found.");
      }

      console.log("Fetching user data...");
      const userDoc = await db.collection("users").doc(currentUser.uid).get();
      const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

      if (!companyID) {
        throw new Error("Company ID not found for the current user.");
      }

      console.log("Fetching top customers...");
      const invoicesSnapshot = await db
        .collection("invoices")
        .where("companyID", "==", companyID)
        .get();

      const customerInvoiceCountMap = new Map();
      invoicesSnapshot.forEach((doc) => {
        const customerName = doc.data().customerName.trim();
        if (!customerInvoiceCountMap.has(customerName)) {
          customerInvoiceCountMap.set(customerName, 1);
        } else {
          customerInvoiceCountMap.set(
            customerName,
            customerInvoiceCountMap.get(customerName) + 1
          );
        }
      });

      const totalInvoices = invoicesSnapshot.size;
      const topCustomers = [...customerInvoiceCountMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([customerName, invoiceCount]) => ({
          customerName,
          percentage: ((invoiceCount / totalInvoices) * 100).toFixed(2),
        }));

      console.log("Top customers data fetched:", topCustomers);
      setTopCustomersData(topCustomers);
    } catch (error) {
      console.error("Error fetching top customers:", error);
      setError("Failed to fetch top customers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Picker
          selectedValue={timeRange}
          style={{ height: 50, width: 150 }}
          onValueChange={(itemValue, itemIndex) => setTimeRange(itemValue)}
        >
          <Picker.Item label="31 Days" value="31" />
          <Picker.Item label="6 Months" value="183" />
          <Picker.Item label="1 Year" value="365" />
          <Picker.Item label="2 Years" value="730" />
          <Picker.Item label="3 Years" value="1095" />
        </Picker>
        <Text style={styles.chartTitle}>Sales Data</Text>
        <LineChart
          data={{
            labels: salesData.map((sale) => sale.date),
            datasets: [
              {
                data: salesData.map((sale) => sale.total),
              },
            ],
          }}
          verticalLabelRotation={90}
          width={Dimensions.get("window").width}
          height={420}
          yAxisSuffix=" €"
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
        <Text style={styles.chartTitle}>Top Selling Products</Text>
        <BarChart
          data={{
            labels: topProductsData.map((product) => product.productName),
            datasets: [
              {
                data: topProductsData.map((product) => product.quantity),
              },
            ],
          }}
          width={Dimensions.get("window").width - 16}
          height={220}
          yAxisSuffix=""
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#ff0000",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
        <Text style={styles.chartTitle}>Top Customers</Text>
        <PieChart
          data={topCustomersData.map((customer, index) => ({
            name: `${customer.customerName} (${customer.percentage}%)`,
            amount: parseInt(customer.percentage),
            color: `#${index + 1}${index + 2}${index + 3}`,
          }))}
          width={Dimensions.get("window").width - 16}
          height={220}
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForLabels: {
              fontSize: 10,
            },
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default DashboardScreen;
// import React, { useState, useEffect } from "react";
// import {
//   StyleSheet,
//   Text,
//   View,
//   Dimensions,
//   ActivityIndicator,
//   ScrollView,
// } from "react-native";
// import { LineChart } from "react-native-chart-kit";
// import { db, auth } from "../firebase";
// import { Picker } from "@react-native-picker/picker";

// const DashboardScreen = () => {
//   const [salesData, setSalesData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [timeRange, setTimeRange] = useState("31");

//   useEffect(() => {
//     fetchSalesData(timeRange);
//   }, [timeRange]);

//   const fetchSalesData = async (range) => {
//     try {
//       const currentUser = auth.currentUser;
//       if (!currentUser) {
//         throw new Error("Current user not found.");
//       }

//       const userDoc = await db.collection("users").doc(currentUser.uid).get();
//       const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

//       if (!companyID) {
//         throw new Error("Company ID not found for the current user.");
//       }

//       const endDate = new Date();
//       const startDate = new Date();

//       switch (range) {
//         case "31":
//           startDate.setDate(endDate.getDate() - 31);
//           break;
//         case "183":
//           startDate.setMonth(endDate.getMonth() - 6);
//           break;
//         case "365":
//           startDate.setFullYear(endDate.getFullYear() - 1);
//           break;
//         case "730":
//           startDate.setFullYear(endDate.getFullYear() - 2);
//           break;
//         case "1095":
//           startDate.setFullYear(endDate.getFullYear() - 3);
//           break;
//         default:
//           startDate.setDate(endDate.getDate() - 31);
//       }

//       const salesSnapshot = await db
//         .collection("invoices")
//         .where("companyID", "==", companyID)
//         .where("date", ">=", startDate)
//         .where("date", "<=", endDate)
//         .orderBy("date")
//         .get();

//       const sales = {};
//       salesSnapshot.forEach((doc) => {
//         const saleData = doc.data();
//         const date = saleData.date.toDate();
//         const day = date.getDate();
//         const month = date.getMonth() + 1;
//         const year = date.getFullYear();
//         const formattedDate = `${day < 10 ? "0" : ""}${day}/${
//           month < 10 ? "0" : ""
//         }${month}/${year}`;
//         const total = parseFloat(saleData.total);
//         if (!isNaN(total)) {
//           if (sales[formattedDate]) {
//             sales[formattedDate] += total;
//           } else {
//             sales[formattedDate] = total;
//           }
//         }
//       });

//       const formattedSalesData = Object.entries(sales).map(([date, total]) => ({
//         date,
//         total: total.toFixed(2),
//       }));

//       setSalesData(formattedSalesData);
//     } catch (error) {
//       console.error("Error fetching sales data:", error);
//       setError("Failed to fetch sales data. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorText}>{error}</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.scrollViewContent}>
//       <View style={styles.container}>
//         <Picker
//           selectedValue={timeRange}
//           style={{ height: 50, width: 150 }}
//           onValueChange={(itemValue, itemIndex) => setTimeRange(itemValue)}
//         >
//           <Picker.Item label="31 Days" value="31" />
//           <Picker.Item label="6 Months" value="183" />
//           <Picker.Item label="1 Year" value="365" />
//           <Picker.Item label="2 Years" value="730" />
//           <Picker.Item label="3 Years" value="1095" />
//         </Picker>
//         <Text style={styles.dateRangeText}>
//           Showing data from {salesData.length > 0 ? salesData[0].date : ""} to{" "}
//           {salesData.length > 0 ? salesData[salesData.length - 1].date : ""}
//         </Text>
//         <Text style={styles.chartTitle}>Sales Data</Text>
//         <LineChart
//           data={{
//             labels: salesData.map((sale) => sale.date),
//             datasets: [
//               {
//                 data: salesData.map((sale) => parseFloat(sale.total)),
//               },
//             ],
//           }}
//           width={Dimensions.get("window").width}
//           height={220}
//           yAxisSuffix=" €"
//           yAxisInterval={1}
//           chartConfig={{
//             backgroundColor: "#e26a00",
//             backgroundGradientFrom: "#fb8c00",
//             backgroundGradientTo: "#ffa726",
//             decimalPlaces: 2,
//             color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
//             labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
//             style: {
//               borderRadius: 16,
//             },
//             propsForDots: {
//               r: "6",
//               strokeWidth: "2",
//               stroke: "#ffa726",
//             },
//           }}
//           bezier
//           style={{
//             marginVertical: 8,
//             borderRadius: 16,
//           }}
//           xLabels={(label, index) => (index % 5 === 0 ? label : "")}
//         />
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 20,
//   },
//   scrollViewContent: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   errorText: {
//     fontSize: 18,
//     color: "red",
//   },
//   dateRangeText: {
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   chartTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
// });

// export default DashboardScreen;
