package main

import (
	"fmt"
)

func main() {
	score := 60
	attendance := 75
	eligible := score >= 50 && attendance >= 80
	fmt.Println("eligible", eligible)
}
