package main

import (
	"fmt"
)

func main() {
	scores := map[string]int{"Ada": 0, "Lin": 7}
	value, found := scores["Ada"]
	fmt.Printf("value=%d found=%t\n", value, found)
}
