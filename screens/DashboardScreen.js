import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { db, auth } from '../firebase';

const DashboardScreen = () => {
  const [salesData, setSalesData] = useState([]);
  const [dateLabels, setDateLabels] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const formattedDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const fetchData = async () => {
    try {
      console.log('Start data fetching');

      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const userUid = currentUser.uid;
      console.log('Current User UID:', userUid);

      const invoicesRef = db.collection('invoices');
      const querySnapshot = await invoicesRef.where('companyID', '==', userUid).get();

      console.log('Query Snapshot:', querySnapshot);

      if (querySnapshot.empty) {
        console.log('No documents found for the current user.');
        setLoading(false);
        return;
      }

      const salesDataArray = [];
      const dateLabelsArray = [];

      querySnapshot.forEach((doc) => {
        try {
          const invoiceDate = doc.data().date.toDate();
          const amount = doc.data().total;

          salesDataArray.push(amount);
          dateLabelsArray.push(formattedDate(invoiceDate));
        } catch (dateError) {
          console.error('Error parsing date:', dateError.message);
        }
      });

      console.log('Sales Data:', salesDataArray);
      console.log('Date Labels:', dateLabelsArray);

      setSalesData(salesDataArray);
      setDateLabels(dateLabelsArray);
      setLoading(false);
      console.log('Data fetching completed successfully');
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setError(`Error fetching data: ${error.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once when the component mounts

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    console.error(error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  console.log('Rendered successfully');

  return (
    <View>
      <Text>DashboardScreen</Text>

      <View>
        <Text>Bezier Line Chart</Text>
        {/* You can use salesData and dateLabels to render the LineChart */}
        <LineChart
          data={{
            labels: dateLabels,
            datasets: [
              {
                data: salesData,
                strokeWidth: 2,
              },
            ],
          }}
          width={Dimensions.get('window').width}
          height={220}
          yAxisLabel={'$'}
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default DashboardScreen;
