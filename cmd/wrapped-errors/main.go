package main

import (
	"errors"
	"fmt"
)

var ErrMissing = errors.New("missing")

func main() {
	err := fmt.Errorf("lookup: %w", ErrMissing)
	fmt.Println(err)
	fmt.Println("missing", errors.Is(err, ErrMissing))
}
