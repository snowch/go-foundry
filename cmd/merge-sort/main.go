package main

import (
	"fmt"
)

func mergeSort(values []int) []int {
	if len(values) < 2 {
		return append([]int{}, values...)
	}
	middle := len(values) / 2
	left, right := mergeSort(values[:middle]), mergeSort(values[middle:])
	out := make([]int, 0, len(values))
	for len(left) > 0 && len(right) > 0 {
		if left[0] <= right[0] {
			out = append(out, left[0])
			left = left[1:]
		} else {
			out = append(out, right[0])
			right = right[1:]
		}
	}
	out = append(out, left...)
	return append(out, right...)
}

func main() {
	values := []int{4, 1, 3, 2}
	fmt.Println("sorted", mergeSort(values))
	fmt.Println("original", values)
}
