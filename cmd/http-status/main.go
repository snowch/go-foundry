package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
)

func handler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	fmt.Fprint(w, "ready")
}

func main() {
	request := httptest.NewRequest("POST", "/", nil)
	response := httptest.NewRecorder()
	handler(response, request)
	fmt.Println(response.Code, strings.TrimSpace(response.Body.String()))
}
