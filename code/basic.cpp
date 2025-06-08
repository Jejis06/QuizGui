#include <iostream>
using namespace std;

bool IsYes(string);                     // if is present in {"tak", "t"}
bool IsNo(string);                      // if is present in {"nie", "n"}
bool IsOZ(char);                        // if is one or zero
bool IsNr(char);                        //   
bool IsLetter(char);                    //
                                    
string RawString(string);               // removes blank chars: {' ', '\n', '\t'}
void SetToFalse(bool*, int);            // sets a dynamic bool array to false
bool tnInput();                         // gets (t/n) input and returns true if an answer is positive and false if is negative
bool HasNr(string);                     // checks if a string contains a number
bool TheSameChar(char, char, bool);     // arguments: first and second char, CAPIT
void CheckExit(string, string, bool);   // check if 'e' was typed as an answer
string LowerCase(string);               // sets all letters to lowercase 
                                    

/***************************************************************************/

bool IsYes(string input) {return (input == "t" || input == "tak");}
bool IsNo(string input) {return (input == "n" || input == "nie");}
bool IsOZ(char a) {return (a == '1' || a == '0');}
bool IsNr(char a) {return (a >= '0' && a <= '9');}
bool IsBlank(char a) {return (a == ' ' || a == '\n' || a == '\t' || (int)a == 0);}
bool IsLetter(char a) {return ((a >= 'a' && a <= 'z') || (a >= 'A' && a <= 'Z'));}


bool TheSameChar(char a, char b, bool CAPIT) {
    if (CAPIT && IsLetter(a) && IsLetter(b)) return (a == b || int(a)+32 == int(b) || int(a)-32 == int(b));
    else return (a == b);
}

void SetToFalse(bool* start, int size) {for (bool* i = start; i < start + size; i++) *i = false;}

string RawString(string s) {
    string res = "";
    for (int i=0; i<s.size(); i++) {
        if (!IsBlank(s[i])) res += s[i];
    }
    return res;
}

bool tnInput() {
    string input;
    getline(cin, input);
    input = RawString(input);
    while (!IsYes(input) && !IsNo(input)) {
        cout << "Wpisz 'tak' lub 'nie'\n";
        getline(cin, input);
    }

    if (IsYes(input)) return 1;
    else return 0;
}

bool HasNr(string s) {
    for (int i=0; i<s.size(); i++) {
        if (IsNr(s[i])) return true;
    }
    return false;
}

// input, answer, BLANK
void CheckExit(string input, string answer="", bool BLANK = false) {
    if (BLANK) {
        input = RawString(input);
        answer = RawString(answer);
    }
    if (input != answer && input.size() == 1 && input[0] == 'e') exit(0);
}

string LowerCase(string s) {
    string res = "";
    for (auto i : s) {
        if ((int)i >= 65 && (int)i <= 90) res += i + 32;
        else res += i;
    }
    return res;
} 


