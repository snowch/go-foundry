package main

import (
	"fmt"
)

var shifts int

func sortValues(values []int) []int {
	for i := 1; i < len(values); i++ {
		value := values[i]
		j := i
		for j > 0 && values[j-1] > value {
			values[j] = values[j-1]
			shifts++
			j--
		}
		values[j] = value
	}
	return values
}

func main() {
	values := []int{4, 3, 2, 1}
	fmt.Println(sortValues(values), "shifts", shifts)
}
