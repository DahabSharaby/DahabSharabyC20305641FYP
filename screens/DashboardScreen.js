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
  const [totalSalesByCustomerData, setTotalSalesByCustomerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("31");

  useEffect(() => {
    fetchSalesData(timeRange);
    fetchTopProducts(timeRange);
    fetchTopCustomers(timeRange);
    fetchTotalSalesByCustomer(timeRange);
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
      console.log("Formatted sales data:", formattedSalesData);
      setSalesData(formattedSalesData);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setError("Failed to fetch sales data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async (range) => {
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

      const invoicesSnapshot = await db
        .collection("invoices")
        .where("companyID", "==", companyID)
        .where("date", ">=", startDate)
        .where("date", "<=", endDate)
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

  const fetchTopCustomers = async (range) => {
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

      const invoicesSnapshot = await db
        .collection("invoices")
        .where("companyID", "==", companyID)
        .where("date", ">=", startDate)
        .where("date", "<=", endDate)
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

  const fetchTotalSalesByCustomer = async (range) => {
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

      console.log("Fetching total sales by customer...");
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

      const invoicesSnapshot = await db
        .collection("invoices")
        .where("companyID", "==", companyID)
        .where("date", ">=", startDate)
        .where("date", "<=", endDate)
        .get();

      const salesByCustomer = {};
      invoicesSnapshot.forEach((doc) => {
        const customerName = doc.data().customerName.trim();
        const total = parseFloat(doc.data().total);
        if (!isNaN(total)) {
          if (customerName in salesByCustomer) {
            salesByCustomer[customerName] += total;
          } else {
            salesByCustomer[customerName] = total;
          }
        }
      });

      console.log("Total sales by customer data fetched:", salesByCustomer);
      const formattedSalesByCustomerData = Object.entries(salesByCustomer).map(
        ([customerName, totalSales]) => ({
          customerName,
          totalSales: totalSales.toFixed(2),
        })
      );

      console.log(
        "Formatted total sales by customer data:",
        formattedSalesByCustomerData
      );
      setTotalSalesByCustomerData(formattedSalesByCustomerData);
    } catch (error) {
      console.error("Error fetching total sales by customer:", error);
      setError(
        "Failed to fetch total sales by customer. Please try again later."
      );
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
  const pieChartColors = [
    "#FF5733", // Red
    "#FFD700", // Gold
    "#00FF00", // Lime
    "#00CED1", // Dark Turquoise
    "#8A2BE2", // Blue Violet
    "#FF69B4", // Hot Pink
    "#FF4500", // Orange Red
    "#7FFF00", // Chartreuse
    "#20B2AA", // Light Sea Green
    "#FF1493", // Deep Pink
    "#00BFFF", // Deep Sky Blue
    "#ADFF2F", // Green Yellow
    "#4682B4", // Steel Blue
    "#FF8C00", // Dark Orange
    "#9400D3", // Dark Violet
  ];

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
          yAxisSuffix="€"
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: "#f5f5f5",
            backgroundGradientFrom: "#FFFFFF",
            backgroundGradientTo: "#FFFFFF",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(53, 108, 173, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(53, 108, 173, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#3570AD",
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
            name: customer.customerName,
            percentage: parseInt(customer.percentage),
            label: `${parseInt(customer.percentage)}%`,
            color: pieChartColors[index % pieChartColors.length],
          }))}
          width={Dimensions.get("window").width - 16}
          height={220}
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForLabels: {
              fontSize: 10,
            },
          }}
          accessor="percentage"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          renderDecorator={({ x, y, dataEntry }) => {
            return (
              <Text
                style={{
                  position: "absolute",
                  top: y - 20,
                  left: x - 20,
                  fontSize: 12,
                  color: "white",
                }}
              >
                {dataEntry.label}
              </Text>
            );
          }}
        />
        <Text style={styles.chartTitle}>Total Sales by Customer</Text>
        <BarChart
          data={{
            labels: totalSalesByCustomerData.map(
              (customer) => customer.customerName
            ),
            datasets: [
              {
                data: totalSalesByCustomerData.map(
                  (customer) => customer.totalSales
                ),
              },
            ],
          }}
          width={Dimensions.get("window").width - 16}
          height={220}
          yAxisSuffix=" €"
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: "#8A2BE2",
            backgroundGradientFrom: "#8A2BE2",
            backgroundGradientTo: "#FF69B4",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
    top: 40,
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
