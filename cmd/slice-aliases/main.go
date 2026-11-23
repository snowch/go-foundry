package main

import (
	"fmt"
)

func main() {
	backing := []int{2, 4, 6}
	left := backing[:2]
	right := backing[1:]
	left[1] = 9
	fmt.Println("left", left)
	fmt.Println("backing", backing)
	fmt.Println("right", right)
}
