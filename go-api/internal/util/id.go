package util

import (
	"crypto/rand"
	"math/big"
	"time"
)

func GenerateID(length int) string {
	const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
	if length <= 0 {
		return ""
	}

	out := make([]byte, length)
	max := big.NewInt(int64(len(alphabet)))
	for i := 0; i < length; i++ {
		n, err := rand.Int(rand.Reader, max)
		if err != nil {
			out[i] = alphabet[time.Now().UnixNano()%int64(len(alphabet))]
			continue
		}
		out[i] = alphabet[n.Int64()]
	}
	return string(out)
}
