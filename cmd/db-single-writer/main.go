package main

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
)

func main() {
	folder, err := os.MkdirTemp("", "go-db-lock-")
	if err != nil {
		panic(err)
	}
	defer os.RemoveAll(folder)
	path := filepath.Join(folder, "writer.lock")
	first, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0600)
	if err != nil {
		panic(err)
	}
	if err := first.Close(); err != nil {
		panic(err)
	}
	releaseFirst := false
	if releaseFirst {
		if err := os.Remove(path); err != nil {
			panic(err)
		}
	}
	second, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0600)
	fmt.Println("second rejected", errors.Is(err, os.ErrExist))
	if second != nil {
		if err := second.Close(); err != nil {
			panic(err)
		}
	}
}
