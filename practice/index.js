const languageCodeMap={
    cpp: 54,
    python: 92,
    javascript: 93,
    java: 91,
}

const code=
`#include<iostream>
using namespace std;
int main(){
    int a,b;
    cin>>a>>b;
    cout<<2*a+3*b<<"Output"<<endl;
    return 0; 
}`

const input="10 12";
const url = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false&fields=*';
const options = {
	method: 'POST',
	headers: {
		'x-rapidapi-key': '19c9db555cmshb18632328e560c1p1b1efbjsn9e19a5f51a9b',
		'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({
		language_id: 54,
		source_code: btoa(code),
		stdin: btoa(input)
	})
};

async function callApi() {
    try {
        const response = await fetch(url, options);
        const result = await response.json();

        if (!result || !result.token) {
            console.error("Error: Invalid response from API. Result:", result);
            return;
        }

        const tokenId = result.token;
        let statusCode = 2; 
        let maxRetries = 20; 
        let retries = 0;
        
        while ((statusCode === 2 || statusCode === 1) && retries < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const submissionResult = await getSubmission(tokenId);
            if (!submissionResult) {
                console.error("Error: Submission result is incomplete", submissionResult);
                break;
            }

            statusCode = submissionResult.status_id;
            console.log(`Status: ${statusCode}`, { submissionResult });

            retries++;
        }

        if (retries >= maxRetries) {
            console.error("Max retries reached. Stopping.");
        }
    } catch (error) {
        console.log("Error occurred", { error });
    }
}

async function getSubmission(tokenId){
    const url = `https://judge0-ce.p.rapidapi.com/submissions/${tokenId}?base64_encoded=true&fields=*`;
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': '19c9db555cmshb18632328e560c1p1b1efbjsn9e19a5f51a9b',
		'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
    const submissionResult = JSON.parse(result);  
        return submissionResult;
} catch (error) {
	console.error(error);
}
}

