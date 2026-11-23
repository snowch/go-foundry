package main

import (
	"errors"
	"fmt"
)

func validateScore(score int) error {
	if score < 0 || score > 100 {
		return errors.New("score must be 0..100")
	}
	return nil
}

func main() {
	score := 101
	if err := validateScore(score); err != nil {
		fmt.Println("invalid", err)
		return
	}
	fmt.Println("valid", score)
}
