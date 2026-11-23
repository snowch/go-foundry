package main

import (
	"fmt"
)

func minimumCoins(coins []int, target int) int {
	best := make([]int, target+1)
	for amount := 1; amount <= target; amount++ {
		best[amount] = -1
		for _, coin := range coins {
			if coin <= amount && best[amount-coin] >= 0 {
				candidate := best[amount-coin] + 1
				if best[amount] < 0 || candidate < best[amount] {
					best[amount] = candidate
				}
			}
		}
	}
	return best[target]
}

func main() {
	coins := []int{1, 3, 4}
	fmt.Println("minimum", minimumCoins(coins, 6))
}
