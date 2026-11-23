package main

import (
	"errors"
	"fmt"
)

func nonNegative(value int) (int, error) {
	if value < 0 {
		return 0, errors.New("negative value")
	}
	return value, nil
}

func main() {
	value, err := nonNegative(-2)
	if err != nil {
		fmt.Println("error", err)
		return
	}
	fmt.Println("value", value)
}
