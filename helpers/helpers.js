// export function productList() {
//     console.log('hello');
// }


import { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';

export function ProductList() {
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    const collectionRef = firebase.firestore().collection('products');

    collectionRef
      .get()
      .then((querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setProductData(data);
      })
      .catch((error) => {
        console.error('Firestore Error:', error);
      });
  }, []); 

  console.log('Product Data:', productData);
  return productData;
}
//      // Make a GET request using the Fetch API
//      fetch(apiUrl)
//      .then(response => {
//        // Check if the request was successful (status code 200-299)
//        if (!response.ok) {
//          throw new Error(`HTTP error! Status: ${response.status}`);
//        }

//        // Parse the JSON response
//        return response.json();
//      })
//      .then(data => {
//        // Handle the data from the API
//        setApiData(data);
//     })
//     .catch(error => {
//       // Handle errors during the fetch operation
//       console.error('Fetch Error:', error);
//     });
// }
// const [apiData, setApiData] = useState(null);
// return response

// const apiUrl = `https://${projectId}.firebaseio.com/users/${userId}/name.json`;