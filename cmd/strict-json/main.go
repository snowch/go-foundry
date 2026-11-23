package main

import (
	"encoding/json"
	"fmt"
	"strings"
)

func main() {
	decoder := json.NewDecoder(strings.NewReader(`{"nae":"Ada"}`))
	decoder.DisallowUnknownFields()
	var person struct {
		Name string `json:"name"`
	}
	if err := decoder.Decode(&person); err != nil {
		fmt.Println("invalid", err)
		return
	}
	fmt.Println(person.Name)
}
