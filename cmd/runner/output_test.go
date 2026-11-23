package main

import (
	"bytes"
	"errors"
	"os"
	"testing"
)

func TestBoundedOutputWritesShortMessagesImmediately(t *testing.T) {
	var target bytes.Buffer
	cancelled := false
	writer := &boundedOutput{target: &target, remaining: 8, cancel: func() { cancelled = true }}
	if _, err := writer.Write([]byte("hi\n")); err != nil || target.String() != "hi\n" {
		t.Fatal("short progress message was buffered", err)
	}
	if n, err := writer.Write([]byte("123456789")); n != 5 || !errors.Is(err, errOutputLimit) || !cancelled || target.String() != "hi\n12345" {
		t.Fatal("output overflow was not bounded and cancelled", n, err, target.String())
	}
}

func TestExecuteStopsOutputOverflow(t *testing.T) {
	file, err := os.CreateTemp("", "go-output-*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(file.Name())
	defer file.Close()
	original := os.Stdout
	os.Stdout = file
	defer func() { os.Stdout = original }()
	code, _ := execute(append(os.Environ(), "FOUNDRY_STATUS_FILE=test"), 60, "/bin/sh", "-c", "yes output")
	if code != 125 {
		t.Fatalf("overflow exit code %d", code)
	}
	info, err := file.Stat()
	if err != nil || info.Size() != 2*1024*1024 {
		t.Fatal("unexpected output size", info, err)
	}
}
