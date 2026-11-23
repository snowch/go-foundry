package main

import (
	"fmt"
)

type Speaker interface{ Speak() string }
type Greeter struct{ Name string }

func (g Greeter) Speak() string { return "Hello, " + g.Name }

type Message struct{ Text string }

func (m Message) Speak() string { return m.Text }
func announce(value Speaker)    { fmt.Println(value.Speak()) }

func main() {
	var chosen Speaker = Greeter{Name: "Ada"}
	announce(chosen)
}
