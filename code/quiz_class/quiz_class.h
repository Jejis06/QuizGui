#include <fstream>
#include <vector>
#include <queue>
using namespace std;

class quiz {
private:
    // in the first line of the file with answers -- for example: "1 0 1" for 1=true and 0=false; by default it's "0 0 0"
    bool BLANK;                             // if blank chars matter in answers
    bool CAPIT;                             // if capital letters matter in answers
    bool TYPOS;                             // if typos ALWAYS aren't allowed in answers (they aren't allowed only in answers with numbers by default)
    int MISTAKES;                           // if typos is set to false; maximum number of mistakes in an answer

    vector<pair<string, string>> qs;        // question set
    int SCORE;                              // 
    
    // build.cpp
    void BuildQue(string);                  // writes the vector<pair<string, string>qs using MakeParts() and BegParts() functions
    void OpenFiles();                       // checks if source.txt and answers are able to open and updates the BLANK, CAPITALS and TYPOS

    // algorithm.cpp
    void MixQs();                           // mixes qs's elements using rand()
    string AskQuestion(int);                // clears screen, asks question and returns an answer 
    short CheckAnswer(string, string, bool);      // checks if the answer is correct, returns -1 if the correct answer has been shown
    void Round();                           // typical quiz's round
                                            
    
public:
    // build.cpp
    quiz();
    void AskParts();                        // gets from the user parts of the quiz

    // algorithm.cpp
    void StartQuiz();                       // asks all of the questions in random order
};

