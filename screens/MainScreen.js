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
import { BarChart, StackedBarChart } from "react-native-chart-kit";


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
  const [totalExpenses, setTotalExpenses] = useState(0); 
  const [topSellingProduct, setTopSellingProduct] = useState("");
  const [totalProfit, setTotalProfit] = useState(0);

  useEffect(() => {

    const calculateTotalProfit = () => {
      const profit = totalSales - totalExpenses;
      setTotalProfit(parseFloat(profit.toFixed(2)));
    };
    calculateTotalProfit();
  

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
          const salesData = {};
          salesSnapshot.forEach((doc) => {
            const saleData = doc.data();
            const date = saleData.date; 
            if (date && date.toDate) {
              const invoiceDate = date.toDate(); 
              const monthYear = `${invoiceDate.toLocaleString("en-US", {
                month: "long",
              })} ${invoiceDate.getFullYear()}`;
              const status = saleData.status;
              const total = parseFloat(saleData.total);
              if (!isNaN(total)) {
                if (!salesData[monthYear]) {
                  salesData[monthYear] = {
                    monthYear,
                    paid: 0,
                    unpaid: 0,
                    overdue: 0,
                  };
                }
                const today = new Date();
                const dateDiff = Math.ceil((today - invoiceDate) / (1000 * 60 * 60 * 24));
      
                if (status === "paid") {
                  salesData[monthYear].paid += total;
                } else if (dateDiff >= 14) {
                  salesData[monthYear].overdue += total;
                } else {
                  salesData[monthYear].unpaid += total;
                }
              }
            } else {
              console.error("Date is undefined or does not have a toDate method:", date);
            }
          });
      
          const formattedSalesData = Object.values(salesData);
      
          console.log("Sales data fetched:", formattedSalesData);
          setSalesData(formattedSalesData);
        } catch (error) {
          console.error("Error fetching sales data:", error);
        }
      };

    // const fetchUnpaidInvoices = async () => {
    //   try {
    //     const currentUser = auth.currentUser;
    //     if (!currentUser) {
    //       throw new Error("Current user not found.");
    //     }

    //     console.log("Fetching unpaid invoices...");
    //     const userDoc = await db.collection("users").doc(currentUser.uid).get();
    //     const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

    //     if (!companyID) {
    //       throw new Error("Company ID not found for the current user.");
    //     }

    //     const unpaidInvoicesSnapshot = await db
    //       .collection("invoices")
    //       .where("companyID", "==", companyID)
    //       .where("status", "!=", "paid")
    //       .get();

    //     const unpaidInvoicesCount = unpaidInvoicesSnapshot.size;
    //     setUnpaidInvoicesCount(unpaidInvoicesCount);

    //     if (unpaidInvoicesCount > 0) {
    //       Alert.alert(
    //         "Unpaid Invoices Notification",
    //         `You have ${unpaidInvoicesCount} unpaid invoices.`,
    //         [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    //       );
    //     }
    //   } catch (error) {
    //     console.error("Error fetching unpaid invoices:", error);
    //   }
    // }; fetchUnpaidInvoices();

    // const getStatusColor = (status, date) => {
    //   const invoiceDate = date.toDate();
    //   const today = new Date();
    //   const dateDiff = Math.ceil((today - invoiceDate) / (1000 * 60 * 60 * 24));

    //   console.log("Invoice date:", invoiceDate);
    //   console.log("Today's date:", today);
    //   console.log("Date difference in days:", dateDiff);

    //   if (status === "paid") {
    //     console.log("Status is paid.");
    //     return "#00FF00"; // Green
    //   } else if (dateDiff >= 14) {
    //     console.log("Invoice is older than 2 weeks.");
    //     return "#FF0000"; // Red (older than 2 weeks)
    //   } else if (dateDiff >= 7) {
    //     console.log("Invoice is 1 week or more old.");
    //     return "#FFFF00"; // Yellow (1 week or more)
    //   } else {
    //     console.log("Invoice is not paid and not older than 1 week.");
    //     return "#FFA500"; // Orange (need to be paid)
    //   }
    // };
    
    const fetchTotalExpenses = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("Current user not found.");
        }
    
        console.log("Fetching total expenses...");
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        const companyID = userDoc.exists ? userDoc.data()?.companyID : null;
    
        if (!companyID) {
          throw new Error("Company ID not found for the current user.");
        }
    
        const expensesRef = db
          .collection("expenses")
          .where("companyID", "==", companyID);
        const snapshot = await expensesRef.get();
        let total = 0;
        snapshot.forEach((doc) => {
          const cost = parseFloat(doc.data().cost);
          if (!isNaN(cost)) {
            total += cost;
          }
        });
        setTotalExpenses(total);
        console.log("Total Expenses:", total);
        
        calculateTotalProfit();
      } catch (error) {
        console.error("Error fetching total expenses:", error);
      }
    };
    

    const fetchTopSellingProduct = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("Current user not found.");
        }

        console.log("Fetching top selling product...");
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

        if (!companyID) {
          throw new Error("Company ID not found for the current user.");
        }

        const invoicesRef = db.collection("invoices").where("companyID", "==", companyID);
        const snapshot = await invoicesRef.get();

        const productSales = {};

        snapshot.forEach((doc) => {
          const productList = doc.data().productList;
          productList.forEach((product) => {
            const productName = product.name;
            const quantity = parseInt(product.quantity);
            if (!isNaN(quantity)) {
              productSales[productName] = (productSales[productName] || 0) + quantity;
            }
          });
        });

        let topSellingProduct = "";
        let maxQuantity = 0;

        Object.entries(productSales).forEach(([product, quantity]) => {
          if (quantity > maxQuantity) {
            maxQuantity = quantity;
            topSellingProduct = product;
          }
        });

        console.log("Top Selling Product:", topSellingProduct);
        console.log("Total Quantity Sold:", maxQuantity);

        setTopSellingProduct(`${topSellingProduct} (${maxQuantity})`);
      } catch (error) {
        console.error("Error fetching top selling product:", error);
      }
    };
    
  

    const unsubscribe = db.collection("invoices").onSnapshot(() => {
      fetchTotalSales();
      fetchNumOrders();
      fetchTopCustomer();
      fetchLatestInvoices();
      fetchSalesData();
      fetchTotalExpenses();
      fetchTopSellingProduct();
      calculateTotalProfit();
      
    });

    const unsubscribe2 = db.collection("expenses").onSnapshot(() => {
      fetchTotalSales();
      fetchTotalExpenses();
      calculateTotalProfit();
    });

    return () => unsubscribe() ,unsubscribe2() ;

    
  }, [totalSales, totalExpenses , totalProfit]);
  
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
            <StackedBarChart
              data={{
                labels: salesData.map((data) => {
                  const [month, year] = data.monthYear.split(" ");
                  const formattedDate = `${month.substring(
                    0,
                    3
                  )}/${year.substring(2)}`;
                  return formattedDate;
                }),
                legend: ["Paid", "Unpaid", "Overdue"],
                data: salesData.map((data) => [
                  data.paid,
                  data.unpaid,
                  data.overdue,
                ]),
                barColors: ["#00FF00", "#FFFF00", "#FF0000"], // Green, Yellow, Red
              }}
              width={Dimensions.get("window").width - 20}
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
                propsForBackgroundLines: {
                  strokeWidth: 1,
                },
                propsForVerticalLabels: {
                  fontSize: 10,
                },
                propsForHorizontalLabels: {
                  fontSize: 8,
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
        <View style={styles.salesInfoContainer2}>
          <SalesInfoCard title="Total Expenses" value={totalExpenses} />
          <SalesInfoCard title="Top Selling Product" value={topSellingProduct} />
          <SalesInfoCard title="Total Profit" value={totalProfit} />
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
      {title === "Total Sales" || title === "Total Expenses" || title === "Total Profit" ? (
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
    marginBottom: 5,
  },
  salesInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "white",
  },
  salesInfoContainer2: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 0,
    
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
