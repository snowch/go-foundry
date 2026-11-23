package main

import (
	"fmt"
)

func main() {
	var value any = "Ada"
	text, ok := value.(string)
	fmt.Printf("text=%q ok=%t\n", text, ok)
}
