import unittest
from typing import List

class tests(unittest.TestCase):

    def setUp(self) -> None:
        self.book_list = BookList()

    def test_create_class(self):
        '''
        Tests the creation of a BookList class.
        '''
        self.assertIsInstance(self.book_list, BookList)

        self.assertEqual(self.book_list.books, [])

    def test_add_book_to_list(self):
        '''
        Tests the add_book function of the BookList class.
        '''
        self.book_list.add_book(Book())

        self.assertIsInstance(self.book_list.books, List[Book()])
        self.assertEqual(current_books, [Book()])

        self.assertRaises(TypeError, self.book_list.add_book, "hello")
        self.assertRaises(TypeError, self.book_list.add_book, 21)
        self.assertRaises(TypeError, self.book_list.add_book, None)

    def test_remove_book_by_index_from_list(self):
        '''
        Tests the remove_book_by_index function of the BookList class.
        '''
        self.book_list.add_book(Book())
        self.book_list.remove_book_by_index(1)
        self.assertEqual(self.book_list.books, [])

        self.assertRaises(IndexError, self.book_list.remove_book_by_index, 1)



    def test_remove_book_by_object_from_list(self):
        '''
        Tests the remove_book_by_object function of the BookList class.
        '''
        self.book_list.add_book(Book())
        self.book_list.remove_book_by_object(Book())
        self.assertEqual(self.book_list.books, [])

        self.assertRaises(IndexError, self.book_list.remove_book_by_object, Book())

    def test_get_book_list(self):
        '''
        Tests the get_book_list function of the BookList class.
        '''
        current_books = self.book_list.get_book_list()
        self.assertEqual(current_books, [])

        self.book_list.add_book(Book())
        current_books = self.book_list.get_book_list()
        self.assertIsInstance(self.book_list.books, List[Book()])
        self.assertEqual(current_books, [Book()])


    def test_get_book_by_id_from_list(self):
        '''
        Tests the get_book_by_id function of the BookList class.
        '''
        self.book_list.add_book(Book())
        self.assertEqual(self.book_list.get_book_by_id(1), Book())

    def test_clear_book_list(self):
        '''
            Tests the clear_book_list function of the BookList class.
        '''
        self.book_list.clear_book_list()
        self.assertEqual(self.books, [])


if __name__ == "__main__":
    unittest.main