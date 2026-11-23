package main

import (
	"fmt"
)

type Counter struct{ Value int }

func (c *Counter) Add(delta int) { c.Value += delta }

func main() {
	counter := Counter{Value: 3}
	counter.Add(2)
	fmt.Println("value", counter.Value)
}
