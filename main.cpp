#include <iostream>
#include <vector>
#include <ctime>
#include <sstream>

class Person {
protected:
    std::string name;
    std::string address;
    std::string email;

public:
    Person(std::string name, std::string address, std::string email) : name(name), address(address), email(email) {}

    std::string getName() { return name; }
    void setName(std::string name) { this->name = name; }

    std::string getAddress() { return address; }
    void setAddress(std::string address) { this->address = address; }

    std::string getEmail() { return email; }
    void setEmail(std::string email) { this->email = email; }
};

class Book {
private:
    int bookID;
    std::string bookName;
    std::string authorFirstName;
    std::string authorLastName;
    std::tm dueDate;
    int memberID;

public:
    Book(int bookID, std::string bookName, std::string authorFirstName, std::string authorLastName,
    std::tm dueDate, int memberID) : bookID(bookID), bookName(bookName), authorFirstName(authorFirstName),
				     authorLastName(authorLastName), dueDate(dueDate), memberID(memberID) {}

    int getBookID() { return bookID; }
    std::string getBookName() { return bookName; }

    std::string getAuthorFirstName() { return authorFirstName; }
    std::string getAuthorLastName() { return authorLastName; }

    std::tm getDueDate() { return dueDate; }
    void setDueDate(std::tm dueDate) { this->dueDate = dueDate; }
};

class Member : public Person {
private:
    int memberID;
    std::vector<Book> booksLoaned;

public:
    Member(int memberID, std::string name, std::string address,
	   std::string email) : Person(name, address, email), memberID(memberID) {}

    int getMemberID() { return memberID; }
    void setMemberID(int memberID) { this->memberID = memberID; }

    std::vector<Book> getBooksBorrowed() { return booksLoaned; }
    void setBooksBorrowed(Book book) { booksLoaned.push_back(book); }

    void returnBook(Book book) {
        for (int i = 0; i < booksLoaned.size(); i++) {
            if (booksLoaned[i].getBookID() == book.getBookID()) {
                booksLoaned.erase(booksLoaned.begin() + i);
                break;
            }
        }
    }

    void displayBorrowedBooks() {
        std::cout << "Member ID: " << memberID << "\n";
        std::cout << "Name: " << name << "\n";
        std::cout << "Address: " << address << "\n";
        std::cout << "Email: " << email << "\n";
        std::cout << "Books Borrowed:\n";
        for (Book book : booksLoaned) {
            std::cout << book.getBookName() << "\n";
        }
    }

    void calcFine() {
        time_t currentTime = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
        for (Book book : booksLoaned) {
            std::tm dueDateTm = book.getDueDate();
            time_t dueTime = std::mktime(&dueDateTm);
            double fine = std::difftime(currentTime, dueTime) / (60 * 60 * 24);
            if (fine > 0) {
                std::cout << "Fine for book: " << book.getBookName() << " is $" << fine << "\n";
            }
        }
    }
};

