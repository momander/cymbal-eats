// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// Author ghaun@google.com
// Simple Cloud Run Service which connects with Spanner

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"
	"github.com/google/uuid"
//1. TODO: IMPORT SPANNER CLIENT LIBRARY
	"google.golang.org/api/iterator"
)


var databaseName string = os.Getenv("SPANNER_CONNECTION_STRING")
//2. TODO: CREATE SPANNER CLIENT VARIABLE

func main() {
	log.Print("Starting server...")
	log.Print("Creating Database if it doesn't exist")

	ctx := context.Background()

	//3. TODO: CREATE A SPANNER CLIENT
	if err != nil {
		log.Fatal(err)
	}

	// Setup http Handles
	http.HandleFunc("/", handler)
	http.HandleFunc("/getAvailableInventory", getAvailableInventory)
	http.HandleFunc("/updateInventoryItem", updateInventoryItem)

	// Determine port for HTTP service.
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Printf("defaulting to port %s", port)
	}

	// Start HTTP server.
	log.Printf("listening on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}

	defer dataClient.Close()

}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")

}

func handler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	fmt.Fprintf(w, "GoLang Inventory Service is running!")
}

func getAvailableInventory(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	response, err := readAvailableInventory(databaseName)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Fprint(w, response)
}

func updateInventoryItem(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.URL.Path != "/updateInventoryItem" {
		http.NotFound(w, r)
		return
	}
	switch r.Method {
	case "GET":
		w.Write([]byte("Please POST the following format for data:  [{'itemID': int,'inventoryChange': int}]"))
		return
	case "OPTIONS":
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.WriteHeader((http.StatusOK))
		return
	case "POST":
		(w).Header().Set("content-type", "application/json")
		d := json.NewDecoder(r.Body)
		d.DisallowUnknownFields()
		il := []struct {
			ItemID          int `json:"itemID"`
			InventoryChange int `json:"inventoryChange"`
		}{}
		err := d.Decode(&il)
		if err != nil {
			log.Print(err)
			return
		}

		log.Print(il)
		inventoryHistoryColumns := []string{
			"ItemRowID",
			"ItemID",
			"inventoryChange",
			"timeStamp"}
		//4. TODO: CREATE A SPANNER MUTATION CONTAINER
		for _, element := range il {
		//5. TODO: INSERT RECORDS USING THE MUTATION CONTAINER
		}
		//6. TODO: APPLY THE MUTATION ATOMICALLY TO THE SPANNER DATABASE 
		if err != nil {
			log.Print(err)
			return
		}
		log.Print("Data added to database")
		w.Write([]byte(http.StatusText(http.StatusOK)))

	default:
		w.WriteHeader(http.StatusNotImplemented)
		w.Write([]byte(http.StatusText(http.StatusNotImplemented)))
	}
}

func readAvailableInventory(db string) (string, error) {
	//7. TODO: CREATE READ ONLY TRANSACTION  
	defer ro.Close()
    //8. TODO: CREATE A SPANNER SQL QUERY
	//9. TODO: QUERY SPANNER AND RETURN RESULTS

	defer iter.Stop()
	type inventoryList struct {
		ItemID    int64
		Inventory int64
	}
	itemList := []inventoryList{}
	for {
		row, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return "", err
		}
		item := inventoryList{}
		if err := row.Columns(&item.ItemID, &item.Inventory); err != nil {
			return "", err
		}
		itemList = append(itemList, item)
	}
	j, err := json.Marshal(itemList)
	if err != nil {
		return "", err
	} else {
		return string(j), err
	}
}