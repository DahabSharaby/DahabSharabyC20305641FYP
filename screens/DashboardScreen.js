import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { LineChart, BarChart, PieChart, YAxis } from "react-native-chart-kit";
import { db, auth } from "../firebase";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

const DashboardScreen = () => {
  const [salesData, setSalesData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [totalSalesByCustomerData, setTotalSalesByCustomerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("31");
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [expensesData, setExpensesData] = useState([]);

  useEffect(() => {
    fetchSalesData(timeRange);
    fetchTopProducts(timeRange);
    fetchTotalSalesByCustomer(timeRange);
    fetchExpensesData(timeRange);
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

  const fetchExpensesData = async (range) => {
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

      const expensesSnapshot = await db
        .collection("expenses")
        .where("companyID", "==", companyID)
        .where("date", ">=", startDate)
        .where("date", "<=", endDate)
        .get();
      const totalExpenses = expensesSnapshot.size;

      const expensesByType = {};

      expensesSnapshot.forEach((doc) => {
        const { type } = doc.data();
        if (type in expensesByType) {
          expensesByType[type]++;
        } else {
          expensesByType[type] = 1;
        }
      });

      const expensesData = Object.entries(expensesByType).map(
        ([type, count]) => ({
          type,
          percentage: (count / totalExpenses) * 100,
        })
      );

      setExpensesData(expensesData);
    } catch (error) {
      console.error("Error fetching expenses data:", error);
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
        ([customerName, total]) => ({
          customerName,
          total: total.toFixed(2),
        })
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

  const chartConfig = {
    backgroundGradientFrom: "white",
    backgroundGradientTo: "white",
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
  };
  const customChartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffa726",
    },
  };
  const chartConfig2 = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(150, 0, 50, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.actionBar} stickyHeaderIndices={[0]}>
          <Text style={styles.title}>Company Overview</Text>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsMenuVisible(true)}
          >
            <Ionicons name="options-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View>
            <Modal
              animationType="slide"
              transparent={true}
              visible={isMenuVisible}
              onRequestClose={() => {
                setIsMenuVisible(false);
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsMenuVisible(false)}
                  >
                    <Ionicons name="close-outline" size={24} color="black" />
                  </TouchableOpacity>
                  <View style={styles.pickerContainer}>
                    <Text style={styles.modalText}>Select Time Range:</Text>
                    <Picker
                      selectedValue={timeRange}
                      style={styles.picker}
                      onValueChange={(itemValue, itemIndex) => {
                        setTimeRange(itemValue);
                        setIsMenuVisible(false);
                      }}
                    >
                      <Picker.Item label="Last 31 days" value="31" />
                      <Picker.Item label="Last 6 months" value="183" />
                      <Picker.Item label="Last 1 year" value="365" />
                      <Picker.Item label="Last 2 years" value="730" />
                      <Picker.Item label="Last 3 years" value="1095" />
                    </Picker>
                  </View>
                </View>
              </View>
            </Modal>
            <Text style={styles.chartTitle}>Total Sales Over Time</Text>
            <LineChart
              data={{
                labels: salesData.map((data) => data.date),
                datasets: [
                  {
                    data: salesData.map((data) => parseFloat(data.total)),
                  },
                ],
              }}
              verticalLabelRotation={90}
              width={Dimensions.get("window").width}
              height={420}
              yAxisLabel="€"
              yAxisSuffix=""
              chartConfig={chartConfig}
            />
            <Text style={styles.chartTitle}>Top 5 Selling Products</Text>
            <BarChart
              data={{
                labels: topProductsData.map((product) => product.productName),
                datasets: [
                  {
                    data: topProductsData.map((product) => product.quantity),
                  },
                ],
              }}
              width={screenWidth}
              height={220}
              yAxisSuffix=" Q"
              chartConfig={customChartConfig}
            />
            <Text style={styles.chartTitle}>Expenses by Category</Text>
            <PieChart
              data={expensesData.map((data, index) => ({
                name: data.type,
                amount: Math.round(data.percentage),
                color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
                  Math.random() * 256
                )}, ${Math.floor(Math.random() * 256)}, 1)`,
              }))}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute
            />
            <Text style={styles.chartTitle}>Total Sales by Customer</Text>

            <BarChart
              data={{
                labels: totalSalesByCustomerData.map(
                  (data) => data.customerName
                ),
                datasets: [
                  {
                    data: totalSalesByCustomerData.map((data) =>
                      parseFloat(data.total)
                    ),
                  },
                ],
              }}
              width={screenWidth}
              height={220}
              yAxisLabel="€"
              yAxisSuffix=""
              chartConfig={chartConfig2}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    zIndex: 1,
    position: "fixed",
    width: "100%",
    top: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  menuButton: {
    marginRight: "auto",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 60,
    marginBottom: 10,
  },
  errorText: {
    textAlign: "center",
    color: "red",
    marginTop: 20,
  },
  modalText: {
    color: "black",
    fontSize: 16,
    marginTop: 10,
    marginLeft: 20,
  },
  pickerContainer: {
    marginTop: 1,
    marginLeft: 20,
    width: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  picker: {
    height: 70,
    width: "100%",
    color: "black",
  },
  centeredView: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    marginLeft: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default DashboardScreen;
