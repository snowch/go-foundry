package main

import (
	"fmt"
)

func main() {
	value := 3.9
	whole := int(value)
	fmt.Printf("decimal %.1f\ninteger %d\n", value, whole)
}
