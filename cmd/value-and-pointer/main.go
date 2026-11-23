package main

import (
	"fmt"
)

func bumpValue(value int)    { value++ }
func bumpPointer(value *int) { *value = *value + 1 }

func main() {
	count := 3
	bumpValue(count)
	fmt.Println("after value", count)
	bumpPointer(&count)
	fmt.Println("after pointer", count)
}
