import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { auth, db } from "../firebase";
import { KeyboardAvoidingView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { BarChart } from "react-native-chart-kit";

const MainScreen = ({ navigation }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [numOrders, setNumOrders] = useState(0);
  const [topCustomer, setTopCustomer] = useState("");
  const [latestInvoices, setLatestInvoices] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [numInvoicesForMonth, setNumInvoicesForMonth] = useState(0);
  const [isInvoiceModalVisible, setIsInvoiceModalVisible] = useState(false);
  const [unpaidInvoicesCount, setUnpaidInvoicesCount] = useState(0);
  const [expensesData, setExpensesData] = useState([]);

  useEffect(() => {
    const fetchTotalSales = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("Current user not found.");
        }

        console.log("Fetching total sales...");
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

        if (!companyID) {
          throw new Error("Company ID not found for the current user.");
        }

        const salesRef = db
          .collection("invoices")
          .where("companyID", "==", companyID);
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
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("Current user not found.");
        }

        console.log("Fetching number of orders...");
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

        if (!companyID) {
          throw new Error("Company ID not found for the current user.");
        }

        const ordersRef = db
          .collection("invoices")
          .where("companyID", "==", companyID);
        const snapshot = await ordersRef.get();
        setNumOrders(snapshot.size);
        console.log("Number of Orders:", snapshot.size);
      } catch (error) {
        console.error("Error fetching number of orders:", error);
      }
    };

    const fetchTopCustomer = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("Current user not found.");
        }

        console.log("Fetching top customer...");
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

        if (!companyID) {
          throw new Error("Company ID not found for the current user.");
        }

        const customersRef = db
          .collection("invoices")
          .where("companyID", "==", companyID);
        const snapshot = await customersRef.get();

        const customerSales = {};

        snapshot.forEach((doc) => {
          const customerName = doc.data().customerName;
          const amount = parseFloat(doc.data().total);
          if (!isNaN(amount)) {
            customerSales[customerName] =
              (customerSales[customerName] || 0) + amount;
          }
        });

        let maxSales = 0;
        let topCustomer = "";
        Object.entries(customerSales).forEach(([customer, sales]) => {
          if (sales > maxSales) {
            maxSales = sales;
            topCustomer = customer;
          }
        });

        setTopCustomer(topCustomer);
        console.log("Top Customer by Sales:", topCustomer);
      } catch (error) {
        console.error("Error fetching top customer:", error);
      }
    };

    const fetchLatestInvoices = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("Current user not found.");
        }

        console.log("Fetching latest invoices...");
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

        if (!companyID) {
          throw new Error("Company ID not found for the current user.");
        }

        const invoicesRef = db
          .collection("invoices")
          .where("companyID", "==", companyID)
          .orderBy("date", "desc")
          .limit(6);

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
              sales[date].push(saleData);
            } else {
              sales[date] = [saleData];
            }
          }
        });

        console.log("Sales data fetched:", sales);
        const formattedSalesData = Object.entries(sales).map(
          ([date, invoices]) => ({
            date,
            total: invoices
              .reduce((acc, curr) => acc + parseFloat(curr.total), 0)
              .toFixed(2),
            numInvoices: invoices.length,
          })
        );

        console.log("Formatted sales data:", formattedSalesData);
        setSalesData(formattedSalesData);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    const fetchUnpaidInvoices = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("Current user not found.");
        }

        console.log("Fetching unpaid invoices...");
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

        if (!companyID) {
          throw new Error("Company ID not found for the current user.");
        }

        const unpaidInvoicesSnapshot = await db
          .collection("invoices")
          .where("companyID", "==", companyID)
          .where("status", "!=", "paid")
          .get();

        const unpaidInvoicesCount = unpaidInvoicesSnapshot.size;
        setUnpaidInvoicesCount(unpaidInvoicesCount);

        if (unpaidInvoicesCount > 0) {
          Alert.alert(
            "Unpaid Invoices Notification",
            `You have ${unpaidInvoicesCount} unpaid invoices.`,
            [{ text: "OK", onPress: () => console.log("OK Pressed") }]
          );
        }
      } catch (error) {
        console.error("Error fetching unpaid invoices:", error);
      }
    };

    const unsubscribe = db.collection("invoices").onSnapshot(() => {
      fetchTotalSales();
      fetchNumOrders();
      fetchTopCustomer();
      fetchLatestInvoices();
      fetchSalesData();
      fetchUnpaidInvoices();
    });

    return () => unsubscribe();
  }, []);

  const navigateToProfile = () => {
    navigation.navigate("ProfileScreen");
  };

  const signOutUser = () => {
    auth.signOut().then(() => {
      navigation.replace("Welcome");
    });
  };

  const handleMenuItemPress = (screen) => {
    navigation.navigate(screen);
    setIsMenuVisible(false);
  };

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const renderInvoiceModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isInvoiceModalVisible}
      onRequestClose={() => setIsInvoiceModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalBackground}
        onPress={() => setIsInvoiceModalVisible(false)}
      >
        <View style={styles.invoiceModalContainer}>
          <Text style={styles.invoiceModalTitle}>{selectedMonth}</Text>
          <Text style={styles.invoiceModalContent}>
            Number of Invoices: {numInvoicesForMonth}
          </Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
  console.log("Sales Data:", salesData);
  console.log(
    "Sales Data Months:",
    salesData.map((data) => data.date)
  );

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <StatusBar style="light" />

      {/* Profile Icon */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={navigateToProfile}
      >
        <Ionicons name="person-circle-outline" size={32} color="black" />
      </TouchableOpacity>

      {/* Menu Button */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Ionicons name="menu" size={32} color="black" />
      </TouchableOpacity>

      <View style={styles.additionalContentContainer}>
        {salesData.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Total Sales Per Month</Text>
            <BarChart
              data={{
                labels: salesData.map((data) => data.date),
                datasets: [
                  {
                    data: salesData.map((data) => parseFloat(data.total)),
                    color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                  },
                ],
              }}
              width={Dimensions.get("window").width - 40}
              height={220}
              yAxisLabel="€"
              yAxisSuffix=""
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: "white",
                backgroundGradientFrom: "white",
                backgroundGradientTo: "white",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                barPercentage: 0.5,
                barRadius: 5,
                decimalPlaces: 2,
                propsForLabels: {
                  fontSize: 12,
                },
                propsForBackgroundLines: {
                  strokeWidth: 1,
                },
                propsForVerticalLabels: {
                  fontSize: 12,
                },
              }}
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
            <View key={index} style={styles.invoiceItem}>
              <Text style={styles.invoiceText}>
                {invoice.number}, Customer: {invoice.customerName}, Total: €
                {invoice.total}
              </Text>
            </View>
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
                iconName="barcode-outline"
                text="Scanner"
                onPress={() => handleMenuItemPress("Scanner")}
              />
              <MenuItem
                iconName="create-outline"
                text="Input"
                onPress={() => handleMenuItemPress("Input")}
              />
              <MenuItem
                iconName="analytics-outline"
                text="Dashboard"
                onPress={() => handleMenuItemPress("Dashboard")}
              />
              <MenuItem
                iconName="cloud-upload-outline"
                text="Forecasting"
                onPress={() => handleMenuItemPress("UploadScreen")}
              />
              <MenuItem
                iconName="people-outline"
                text="Admin"
                onPress={() => handleMenuItemPress("Admin")}
              />
              <MenuItem
                iconName="document-outline"
                text="Invoice"
                onPress={() => handleMenuItemPress("InvoiceScreen")}
              />
              <MenuItem
                iconName="card-outline"
                text="Payments"
                onPress={() => handleMenuItemPress("Payments")}
              />
              <MenuItem
                iconName="briefcase"
                text="Expenses"
                onPress={() => handleMenuItemPress("Expenses")}
              />
              <MenuItem
                iconName="log-out-outline"
                text="Sign Out"
                onPress={signOutUser}
              />
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {renderInvoiceModal()}
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
    top: 30,
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
    color: "black",
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
    backgroundColor: "black",
    borderRadius: 10,
    padding: 10,
    width: "30%",
    marginBottom: 20,
  },
  salesInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "white",
  },
  salesInfoValue: {
    fontSize: 14,
    color: "white",
  },
  latestInvoicesContainer: {
    marginTop: 20,
  },
  latestInvoicesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "black",
  },
  invoiceItem: {
    backgroundColor: "black",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  invoiceText: {
    fontSize: 14,
    color: "white",
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
  invoiceModalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  invoiceModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "black",
  },
  invoiceModalContent: {
    fontSize: 16,
    color: "black",
  },
});

export default MainScreen;
