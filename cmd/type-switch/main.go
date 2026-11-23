package main

import (
	"fmt"
)

func describe(value any) string {
	switch item := value.(type) {
	case int:
		return fmt.Sprintf("integer %d", item)
	case string:
		return fmt.Sprintf("text %q", item)
	default:
		return "other"
	}
}

func main() {
	fmt.Println(describe(7))
}
