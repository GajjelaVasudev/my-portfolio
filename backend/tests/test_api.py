"""
Tests for API schemas, models, and fallback behavior.
"""

import unittest
from pydantic import ValidationError
from backend.main import ChatRequest, ChatTurn
from backend.llm import generate_grounded_answer, FALLBACK_MESSAGE


class TestApiSchemas(unittest.TestCase):
    def test_chat_request_validation(self):
        # Valid request
        req = ChatRequest(query="What is your background in Java?")
        self.assertEqual(req.query, "What is your background in Java?")
        self.assertIsNone(req.history)

        # Too short query (min_length=2)
        with self.assertRaises(ValidationError):
            ChatRequest(query="?")

        # Too long query (max_length=500)
        with self.assertRaises(ValidationError):
            ChatRequest(query="A" * 501)

    def test_chat_turn_validation(self):
        turn = ChatTurn(role="user", content="Hello!")
        self.assertEqual(turn.role, "user")
        self.assertEqual(turn.content, "Hello!")

    def test_grounded_answer_fallback_on_empty_chunks(self):
        result = generate_grounded_answer(
            query="What is your favorite ice cream flavor?",
            retrieved_chunks=[]
        )
        self.assertTrue(result["is_fallback"])
        self.assertEqual(result["sources"], [])
        self.assertIn(FALLBACK_MESSAGE, result["answer"])


if __name__ == "__main__":
    unittest.main()
