import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { auth, db } from "../firebase";
import { KeyboardAvoidingView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";

const MainScreen = ({ navigation }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [numOrders, setNumOrders] = useState(0);
  const [topCustomer, setTopCustomer] = useState("");
  const [latestInvoices, setLatestInvoices] = useState([]);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const fetchTotalSales = async () => {
      try {
        const salesRef = db.collection("invoices");
        const snapshot = await salesRef.get();
        let total = 0;
        snapshot.forEach((doc) => {
          const amount = parseFloat(doc.data().total);
          if (!isNaN(amount)) {
            total += amount;
          }
        });
        setTotalSales(total);
        console.log("Total Sales:", total);
      } catch (error) {
        console.error("Error fetching total sales:", error);
      }
    };

    const fetchNumOrders = async () => {
      try {
        const ordersRef = db.collection("invoices");
        const snapshot = await ordersRef.get();
        setNumOrders(snapshot.size);
        console.log("Number of Orders:", snapshot.size);
      } catch (error) {
        console.error("Error fetching number of orders:", error);
      }
    };

    const fetchTopCustomer = async () => {
      try {
        const customersRef = db.collection("invoices");
        const snapshot = await customersRef.get();

        const customerInvoicesCount = {};

        snapshot.forEach((doc) => {
          const customerName = doc.data().customerName;
          if (customerName in customerInvoicesCount) {
            customerInvoicesCount[customerName]++;
          } else {
            customerInvoicesCount[customerName] = 1;
          }
        });

        let maxInvoices = 0;
        let topCustomer = "";
        Object.entries(customerInvoicesCount).forEach(([customer, count]) => {
          if (count > maxInvoices) {
            maxInvoices = count;
            topCustomer = customer;
          }
        });

        setTopCustomer(topCustomer);
        console.log("Top Customer:", topCustomer);
      } catch (error) {
        console.error("Error fetching top customer:", error);
      }
    };

    const fetchLatestInvoices = async () => {
      try {
        const invoicesRef = db
          .collection("invoices")
          .orderBy("date", "desc")
          .limit(5);
        const snapshot = await invoicesRef.get();
        const invoices = [];
        snapshot.forEach((doc) => {
          invoices.push({
            number: doc.data().invoiceNumber,
            customerName: doc.data().customerName,
            total: doc.data().total,
          });
        });
        setLatestInvoices(invoices);
        console.log("Latest Invoices:", invoices);
      } catch (error) {
        console.error("Error fetching latest invoices:", error);
      }
    };

    fetchTotalSales();
    fetchNumOrders();
    fetchTopCustomer();
    fetchLatestInvoices();
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
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
      startDate.setFullYear(endDate.getFullYear() - 1);

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
        const date = saleData.date
          .toDate()
          .toLocaleDateString("en-US", { month: "short" });
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
    }
  };

  const navigateToProfile = () => {
    navigation.navigate("Profile");
  };

  const signOutUser = () => {
    auth.signOut().then(() => {
      navigation.replace("Welcome");
    });
  };

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <StatusBar style="light" />

      {/* Profile Icon */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate("ProfileScreen")}
      >
        <Ionicons name="person-circle-outline" size={32} color="black" />
      </TouchableOpacity>

      {/* Menu Button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setIsMenuVisible(true)}
      >
        <Ionicons name="menu" size={32} color="black" />
      </TouchableOpacity>

      <View style={styles.additionalContentContainer}>
        {salesData.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Total Sales Line Chart</Text>
            <LineChart
              data={{
                labels: salesData.map((data) => data.date),
                datasets: [
                  {
                    data: salesData.map((data) => parseFloat(data.total)),
                  },
                ],
              }}
              width={Dimensions.get("window").width - 40}
              height={220}
              yAxisLabel="€"
              yAxisSuffix=""
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
              style={styles.chart}
            />
          </View>
        )}

        {/* Sales Information */}
        <View style={styles.salesInfoContainer}>
          <SalesInfoCard title="Total Sales" value={totalSales} />
          <SalesInfoCard title="Number of Orders" value={numOrders} />
          <SalesInfoCard title="Top Customer" value={topCustomer} />
        </View>

        {/* Latest Invoices */}
        <View style={styles.latestInvoicesContainer}>
          <Text style={styles.latestInvoicesTitle}>Latest Invoices</Text>
          {latestInvoices.map((invoice, index) => (
            <Text key={index} style={styles.invoiceItem}>
              Invoice: {invoice.number}, Customer: {invoice.customerName},
              Total: €{invoice.total}
            </Text>
          ))}
        </View>
      </View>

      {/* Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackground}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <TouchableOpacity onPress={() => setIsMenuVisible(false)}>
                <Ionicons name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <MenuItem
                iconName="ios-barcode-outline"
                text="Scanner"
                onPress={() => navigation.navigate("Scanner")}
              />
              <MenuItem
                iconName="ios-create-outline"
                text="Input"
                onPress={() => navigation.navigate("Input")}
              />
              <MenuItem
                iconName="ios-analytics-outline"
                text="Dashboard"
                onPress={() => navigation.navigate("Dashboard")}
              />
              <MenuItem
                iconName="ios-people-outline"
                text="Admin"
                onPress={() => navigation.navigate("Admin")}
              />
              <MenuItem
                iconName="ios-document-outline"
                text="Invoice"
                onPress={() => navigation.navigate("InvoiceScreen")}
              />
              <MenuItem
                iconName="ios-log-out-outline"
                text="Sign Out"
                onPress={signOutUser}
              />
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const MenuItem = ({ iconName, text, onPress }) => {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons
        name={iconName}
        size={24}
        color="black"
        style={styles.menuItemIcon}
      />
      <Text style={styles.menuItemText}>{text}</Text>
    </TouchableOpacity>
  );
};

const SalesInfoCard = ({ title, value }) => {
  return (
    <View style={styles.salesInfoCard}>
      <Text style={styles.salesInfoTitle}>{title}</Text>
      {title === "Total Sales" ? (
        <Text style={styles.salesInfoValue}>€{value} </Text>
      ) : (
        <Text style={styles.salesInfoValue}>{value}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  menuButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 999,
  },
  additionalContentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  chartContainer: {
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  salesInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  salesInfoCard: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 10,
    width: "30%",
  },
  salesInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  salesInfoValue: {
    fontSize: 14,
  },
  latestInvoicesContainer: {
    width: "50%",
  },
  latestInvoicesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  invoiceItem: {
    fontSize: 14,
    width: "50%",
    flexDirection: "row",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "white",
    alignItems: "flex-start",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 40,
    elevation: 5,
    width: "100%",
    maxHeight: "100%",
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    width: "100%",
    minHeight: 200,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginRight: 10,
  },
  menuItemIcon: {
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 18,
    flexWrap: "wrap",
    color: "black",
    fontWeight: "bold",
  },
  profileButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 999,
  },
});

export default MainScreen;
