#include <iostream>
#include <random>
#include <time.h>

#include <stack>
#include <vector>
#include <queue>

#include "quiz_class.h"
using namespace std;

struct comp;
// TODO: polskie znaki
// basic.cpp
bool IsYes(string);
bool IsNo(string);
bool tnInput();
bool IsLetter(char);
bool IsBlank(char);
string RawString(string);
void SetToFalse(bool*, int);
bool HasNr(string);
void CheckExit(string, string, bool);
string LowerCase(string);

// for main functions
inline void AssignPq(int);                            // assignes pq with i*{i, 0} for i in {0, arg}
void PrintPq();
bool IsK(string);                                     // checks if there are "K/" in the line
vector<string> DivideIntoWords(string, bool);         // divides into words by ','
bool TheSameString(string, string, bool, bool, bool, int); // for the CheckAnswer()

// class
// private:
//      void quiz::MixQs();                     // mixes qs's elements using rand()
//      string quiz::AskQuestion(int);          // clears screen, asks question and returns an answer
//      short CheckAnswer(string, string);      // checks if the answer is correct, returns -1 if the correct answer has already been shown
//      void quiz::Round();                     // an infinity loop
// public:
//      void quiz::StartQuiz();                 // asks all of the questions in random order and then triggers Round()


// global variables
struct comp {
    // returns true if pair<int, int> p1 should be found before pair<int, int> p2
    bool operator()(const pair<int, unsigned int>& p1,
                    const pair<int, unsigned int>& p2) const
    { return p1.second > p2.second; }
};
// sorts from the smallest to the highest value by the second variable; allows duplications
priority_queue<pair<int, unsigned int>, vector<pair<int, unsigned int>>, comp> pq;






/************************************************************************************************/

// DEBUG 
void PrintPq() {

    priority_queue<pair<int, unsigned int>, vector<pair<int, unsigned int>>, comp> pq1;
    pq1 = pq;
    cout << "\n----\n" << pq.size() << "\n";
    while(!pq.empty()) {
        cout << pq.top().first +1<< " , " << pq.top().second << '\n';
        pq.pop();
    }
    pq = pq1;
    cout << "\n----\n";
    cin.get();
}


inline void AssignPq(int size) {for (int i=0; i<size; i++) pq.push({i, 0});}

void quiz::StartQuiz() {
    MixQs();

    for (int i=0; i<qs.size(); i++) {
        string answer = AskQuestion(i);
        short correct = CheckAnswer(answer, qs[i].second, IsK(qs[i].first));
        if (correct == 1) {
            SCORE++;
            if (SCORE == qs.size()) {
                cout << "\nBrawo! Odpowiedziałeś dobrze na wszystkie pytania za pierwszym razem.\n"
                        "Czy chcesz kontynuować? (t/n)\n";

                bool tn_answer = tnInput();
                if (tn_answer) {
                    AssignPq(qs.size());
                    break;
                }
                else exit(0);
            }
        }
        else {
            SCORE--;

            string correct_answer = qs[i].second;
            if (correct!=-1) cout << correct_answer << '\n';
            string cinget;
            getline(cin, cinget);

            // '.' tells that the answer was correct; undo
            if (cinget.size() == 1 && cinget[0] == '.') {
                SCORE++;
                continue;
            }

            pq.push({i, 0}); 
        }
    }

    cout << "Już wszystkie pytania były zadane przynajmniej raz.\n";
    cin.get();

    Round();
}


void quiz::MixQs() {
    srand(time(NULL));
    for (int i=0; i<qs.size()-2; i++) {
        int r = rand() % (qs.size()-i) + i;
        swap(qs[i], qs[r]);
    }
}

vector<string> DivideIntoWords(string s) {
    vector<string> res;
    string word = "";

    for (int i=0; i<s.size(); i++) {
        // next word
        if ((s[i] == ',') && RawString(word).size() != 0) {
            res.push_back(word);
            word = "";
            if (IsBlank(s[i+1])) i+=1;
            continue;
        }

        if (s[i] != ',') word += s[i];

        // last word
        if (i == s.size() -1 && RawString(word).size() != 0) {
            res.push_back(word);
            word = "";
        }
    }

    return res;
}

bool TheSameString(string a, string c, bool blank, bool capit, bool typos, int mistakes_max) {
    // bad length
    if (!typos && a.size() != c.size()) return false;
    else if (a.size() + mistakes_max < c.size() || a.size() - mistakes_max > c.size()) return false;

    if (!blank) {
        a = RawString(a);
        c = RawString(c);
    }
    if (!capit) {
        a = LowerCase(a);
        c = LowerCase(c);
    }

    if (!typos) return (a == c);
    else {
        int mistakes = 0;

        for (int i=0; i<min(a.size(), c.size()); i++) { // TODO: may not working properly. Add a better typos detect algorithm
            if (a[i] != c[i]) {
                if (i>0 && a[i-1] == c[i]) continue;
                else if (i<a.size()-1 && a[i+1] == c[i]) continue;
                else mistakes++;
            }
        }

        if (mistakes > mistakes_max) return false;
    }

    return true;
}

                        // answer, correct
short quiz::CheckAnswer(string a, string c, bool isK = false) {
    // don't allow to do typos when answering a date
    const bool typos_allowed = (TYPOS == false && !HasNr(a) && a.size() > 5);

    // "K/" mode
    if (isK) {
        vector<string> a_div = DivideIntoWords(a);
        vector<string> c_div = DivideIntoWords(c);

        vector<string> not_correct, not_present;
        bool* present = new bool[c_div.size()];
        SetToFalse(present, c_div.size());

        for (int i=0; i<a_div.size(); i++) {
            bool cor = false;

            for (int j=0; j<c_div.size(); j++) {
                if (!present[j] && TheSameString(a_div[i], c_div[j], BLANK, CAPIT, typos_allowed, MISTAKES)) {
                    present[j] = true;
                    cor = true;
                    break;
                }
            }

            if (!cor) not_correct.push_back(a_div[i]);
        }
        
        for (int i=0; i<c_div.size(); i++) {
            if (!present[i]) not_present.push_back(c_div[i]);
        }

        delete[] present;

        if (not_present.size() == c_div.size()) return 0;
        
        else if (!not_present.empty() || !not_correct.empty()){

            if (!not_present.empty()) {
                cout << "\nBrakuje: ";
                for (int i=0; i<not_present.size(); i++) {
                    cout << not_present[i];
                    if (i != not_present.size() - 1) cout << ", ";
                }
                cout << '\n'; // may 01
            }

            if (!not_correct.empty()) {
                cout << "Źle:\t ";
                for (int i=0; i<not_correct.size(); i++) {
                    cout << not_correct[i];
                    if (i != not_correct.size() - 1) cout << ", ";
                }
                cout << '\n';
            }

            return -1;
        }

        else return 1;
    }
    
    // without "K/"
    else if (BLANK == false) {
        a = RawString(a);
        c = RawString(c);
    }

    return (TheSameString(a, c, BLANK, CAPIT, typos_allowed, MISTAKES)); 
}

string quiz::AskQuestion(int ind) {
    system("clear");
    cout << "SCORE: " << SCORE << '\n';

    string question = qs[ind].first;
    if (question[0] == 'K' && question[1] == '/') question.erase(0,3);
    while (IsBlank(question[0])) question.erase(0, 0); // may 01

    cout << question << '\n';

    string input;
    getline(cin, input);
    CheckExit(input, qs[ind].second, BLANK);

    return input;
}

bool IsK(string question) {
    question = RawString(question);
    if (question.size() >= 2 && question[0] == 'K' && question[1] == '/') return true;
    else return false;
}

void quiz::Round() {
    const int QS_SIZE = qs.size();                      
    const int F = max(int(0.2 * double(QS_SIZE + 1)), 1);   // a question can't be asked if it was asked in F (20% of number of questions) rounds

    queue<int> lastf;                                   
    bool in_lastf[QS_SIZE];                             
    SetToFalse(in_lastf, QS_SIZE);

    stack<pair<int, int>> st;                           // stack used to find pq.top() which wasn't asked in last F rounds
    pair<int, int> curr;                                
    unsigned /*long long*/ int priority_v = 1;          
                                                
    while (1) {
        // find using <stack> an element which isnt in lastf 
        while (in_lastf[pq.top().first] && pq.size() > 1) { 
            st.push(pq.top());
            pq.pop();
        }
        curr = pq.top();        
        pq.pop();

        string answer = AskQuestion(curr.first);
        short correct = CheckAnswer(answer, qs[curr.first].second, IsK(qs[curr.first].first));

        if (lastf.size() > F) {
            in_lastf[lastf.front()] = false;
            lastf.pop();
        }

        in_lastf[curr.first] = true;
        lastf.push(curr.first);
        
        if (correct == 1) {
            SCORE++;
            curr.second += priority_v++;
        }
        else {
            SCORE--;
            
            string correct_answer = qs[curr.first].second;

            if (answer.size()) cout << '\n';
            if (correct == 0) cout << correct_answer << '\n';

            string cinget;
            getline(cin, cinget);
            
            // '.' tells that the answer was correct; undo
            if (RawString(cinget)[0] == '.') {
                SCORE++;
                curr.second += priority_v++;
            }
        }

        pq.push(curr);
        while (!st.empty()) {
            pq.push(st.top());
            st.pop();
        }
    }
}

