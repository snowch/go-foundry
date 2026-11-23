package main

import (
	"encoding/json"
	"fmt"
)

type Person struct {
	Name string `json:"name"`
	Age  int    `json:"age"`
}

func main() {
	data := []byte(`{"name":"Ada","age":37}`)
	var person Person
	if err := json.Unmarshal(data, &person); err != nil {
		panic(err)
	}
	fmt.Println(person.Name, person.Age)
}
