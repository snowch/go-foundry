package main

import "fmt"

func main() {
	items := 7
	groupSize := 3
	fmt.Println("complete groups", items/groupSize)
	fmt.Println("left over", items%groupSize)
	fmt.Println("decimal quotient", float64(items)/float64(groupSize))
}
