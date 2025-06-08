#include <iostream>
#include <fstream>
#include "quiz_class.h"
using namespace std;

// basic.cpp
void SetToFalse(bool*, int);
string RawString(string);
bool IsOZ(char);
bool IsNr(char);
bool tnInput();

string GetExactLine(int);               // getline() but for the exact line in file
bool ActiveLine(string);                // checks if the line is not a comment, is not empty and has the '-' char
                                
// for main functions
bool CorrectInput(string);              // checks if parts on input are typed correctly
vector<int> MakeParts();                // returns sizes for parts; [0] is a minimum size and [1] is a maximal size 
vector<int> BegParts();                 // returns a vector of numbers of lines in the file which are beginnings of the parts
pair<string, string> ToQs(string);      // divides a line into a question and it's answer

// class
// void quiz::OpenFiles();              // checks if source.txt and answers are able to open and then updates the BLANK, CAPIT and TYPOS variables
// void quiz::AskParts();               // gets from the user parts of the quiz (public) 
// void quiz::BuildQue(string);         // writes the vector<pair<string, string>qs using MakeParts() and BegParts() functions (private)


// global variables
int Q = 0;                              // number of active lines in the answer file
string SRC;                             // source.txt's content
                                        


/************************************************************************************** constructor *******/

quiz::quiz() {
    MISTAKES = 1;

    BLANK = false;
    CAPIT = false; // different than rest because tells if capitals ARE ALLOWED
    TYPOS = false;
    SCORE = 0;

    OpenFiles();
}

/**************************************************************************************** basic ***********/

string GetExactLine(int n) {
    ifstream file;
    file.open(SRC, ios::in);
    if (!file.is_open()) {
        cout << "Plik source.txt jest błędny.\n";
        exit(0);
    }

    string line;
    int line_counter = 0;
    while (getline(file, line)) {
        line_counter++;
        if (line_counter == n) {
            file.close();
            return line;
        } 
    }

    file.close();
    return "";
}

bool ActiveLine(string line) {
    if ((line[0] == '/' && line[1] == '/') || line.size() == 0 || line[0] == '\n') return false;
    line = RawString(line);
    for (int i=0; i<line.size(); i++) {
        if (line[i] == '-') return true;
    }
    return false;
}

/***************************************************************************************** for main *******/

bool CorrectInput(string s) {
    const int amm_parts = Q/10 + 1;

    string sraw = RawString(s);
    if (sraw.size() == 0) return false;
    if (sraw[0] == 'w' && sraw.size() == 1) return true; 
    
    // 'e' == end of the program
    else if (sraw[0] == 'e' && sraw.size() == 1) exit(0);

    bool* used = new bool[amm_parts+1];
    SetToFalse(used, amm_parts+1);
    s += ' '; // triggers end of a number at the end of input
    string nr = "";
    for (int i=0; i<s.size(); i++) {
        if (s[i] == ' ') {
            if (nr == "" || (nr.size() == 1 && (int)nr[0] == 0)) continue;
            else if (stoi(nr) > amm_parts || used[stoi(nr)]) {
                delete[] used;
                return false;
            }
            used[stoi(nr)] = true;
            nr = "";
        }
        else if (s[i] < '1' || s[i] > '9') {
            delete[] used;
            return false;
        }
        else nr += s[i];
    } 
    delete[] used;
    return true;
}

pair<string, string> ToQs(string s) {
    pair<string, string> res = {"", ""};

    bool answer = false;
    for (int i=0; i<s.size(); i++) {
        if (s[i] == '/' && s[i+1] == '/') break;
        else if (s[i] == '-' && !answer) answer = true;
        else if (!answer) res.first += s[i];
        else if (answer) res.second += s[i];
    }

    if (res.second == "" || res.first == "" || RawString(res.second).size() == 0) return {"", ""};
    return res;
}

vector<int> MakeParts() {
    vector<int> res;
    
    if (Q <= 15) res.assign(2+1, Q); 
    else {
        // number of parts
        const int p = Q/10 + 1;
        // minimal and maximal part sizes
        const int mini = Q/p;
        int maks = mini;

        res.assign(p+2, mini);

        int c = 0, ind = 2;
        while (p * mini + c < Q) {
            res[ind]++;
            c++; 

            if (ind == 2) maks++;
            ind++;
            if (ind > res.size()-1) ind = 2;
        }

        res[0] = mini;
        res[1] = maks;
    }
    
    return res;
}

vector<int> BegParts() {
    vector<int> parts = MakeParts();
    vector<int> res;
    res.assign(parts.size()-2, -1);

    ifstream file;
    file.open(SRC, ios::in);
    if (!file.is_open()) {
        cout << "Plik source.txt jest błędny.\n";
        exit(0);
    }


    // cc -- na którym pytaniu jesteś w partii
    // ind -- numer partii
    
    int cc = 0, ind = 0, line_nr = 0;
    string line;
    while (getline(file, line)) {
        line_nr++;
        if (ActiveLine(line)) {
            if (cc == 0) res[ind] = line_nr;
            cc++;
            if (cc == parts[ind+2]) {
                cc = 0;
                ind++;
            }
        }
    }

    res.push_back(line_nr+1);

    file.close();
    return res;
}

/**************************************************************************************** class ***********/

void quiz::OpenFiles() {
    string line;
    ifstream srcfile, file;

    srcfile.open("source.txt", ios::in);
    if (!srcfile.is_open()) {
        cout << "Plik source.txt nie istnieje.\n";
        exit(0);
    }
    getline(srcfile, SRC);
    
    file.open(SRC, ios::in);
    if (!file.is_open()) {
        cout << "Plik "<< SRC <<" nie istnieje.\n";
        exit(0);
    }

    bool first = true;
    while (getline(file, line)) {
        if (ActiveLine(line)) Q++;

        else if (first) {
            line = RawString(line);
            // if the first line is probably the BLANK, CAPIT and TYPOS variables... 
            if (line.size() == 3 && IsNr(line[0]) && IsNr(line[1]) && IsNr(line[2])) {
                if (IsOZ(line[0]) && IsOZ(line[1]) && IsOZ(line[2])) {
                    BLANK = (line[0] == '1')? true : false;
                    CAPIT = (line[1] == '1')? true : false;
                    TYPOS = (line[2] == '1')? true : false;
                }
                else {
                    // mistake in the first line 
                    cout << "UWAGA: W linii pierwszej w pliku " << SRC << " jest błąd.\nChcesz kontynuować? (t/n)\n";
                    bool tn_answer = tnInput();
                    if (!tn_answer) exit(0);
                    else system("clear");
                }
            }
        }

        first = false;
    }
    // question_set.txt is empty
    if (first) {
        cout << "Plik "<< SRC <<" jest pusty.\n";
        exit(0);
    }
    srcfile.close();
    file.close();
}

void quiz::AskParts() {
    vector<int> parts = MakeParts();
    string input = "";
    const int P_SIZE = parts.size()-2;

    if (P_SIZE == 1) {
        const int Q_SIZE = parts[0];
        if (Q_SIZE == 1) {
            cout << "W pliku znajduje się tylko jedno pytanie.\n";
            exit(0);
        }

        cout << "Quiz nie został podzielony na części. "; 
        if (Q_SIZE > 1 && Q_SIZE <= 4) cout << "Są " << Q_SIZE << " pytania.\n";
        else if (Q_SIZE >= 5 && Q_SIZE <= 21) cout << "Jest " << Q_SIZE << " pytań.\n";

        cout << "Zaczynamy?\n";
        string cinget;
        getline(cin, cinget);
        input = "1";

        if (RawString(cinget).size() == 1 && (cinget[0] == 'e' || cinget[0] == 'n') || RawString(cinget) == "nie") exit(0);
    }
    else {
        cout << "Quiz został podzielony na " << P_SIZE << " części po " << parts[0];
        if(parts[0] != parts[1]) cout << "-" << parts[1];
        cout << " pytań. \nKtóre z części chcesz dzisiaj przećwiczyć? Jeśli chcesz przećwiczyć "
                "wszystkie z nich, wpisz 'w'.\n";

        getline(cin, input);

        while (!CorrectInput(input)) {
            cout << "Wpisz 'w' lub oddzielone od siebie spacją części quizu.\n";
            getline(cin, input);
        }
    }
    
    if (RawString(input)[0] == 'w') {
        input = "";
        for (int i=1; i<=parts.size()-2; i++){
            input += char(i+48);
            input += ' ';
        } 

    }
    BuildQue(input);
}

void quiz::BuildQue(string input) {
    vector<int> beg_parts = BegParts();

    string nr = "";
    input += ' ';
    for (int i=0; i<input.size(); i++) {
        if (input[i] == ' ' || i == input.size() - 1) {
            if (nr == "") continue;
            int nr_i = stoi(nr);
            for (int i=beg_parts[nr_i-1]; i<beg_parts[nr_i] && i<beg_parts[beg_parts.size()-1]; i++) {
                if (ActiveLine(GetExactLine(i))) {
                    pair<string, string> to_qs = ToQs(GetExactLine(i));
                    if (to_qs.first != "") qs.push_back(to_qs);
                }
            }
            nr = "";
        }
        else nr += input[i];
    }

    /* for (auto i:qs) cout << i.first << '\n' << i.second << "\n\n";
    cin.get(); */
}

