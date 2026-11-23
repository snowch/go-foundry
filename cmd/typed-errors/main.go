package main

import (
	"errors"
	"fmt"
)

type LimitError struct{ Limit int }

func (e *LimitError) Error() string { return fmt.Sprintf("limit %d", e.Limit) }

func main() {
	err := fmt.Errorf("save failed: %w", &LimitError{Limit: 3})
	var detail *LimitError
	if errors.As(err, &detail) {
		fmt.Println("limit", detail.Limit)
	} else {
		fmt.Println("no limit detail")
	}
}
