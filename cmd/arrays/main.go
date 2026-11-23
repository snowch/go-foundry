package main

import (
	"fmt"
)

func main() {
	values := [3]int{2, 4, 6}
	values[1] = 9
	fmt.Println(values)
}
