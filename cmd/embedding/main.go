package main

import (
	"fmt"
)

type Address struct{ City string }
type Person struct {
	Name string
	Address
}

func main() {
	person := Person{Name: "Ada", Address: Address{City: "London"}}
	fmt.Println("promoted", person.City, "nested", person.Address.City)
}
