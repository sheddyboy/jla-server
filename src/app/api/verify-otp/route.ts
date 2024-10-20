// import { dataObject, errorObject } from "@/utils";
// import twilio from "twilio";

// const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } =
//   process.env;

// const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// export async function POST(request: Request) {
//   try {
//     const { phoneNumber, code } = await request.json();

//     if (!phoneNumber || !code) {
//       return errorObject(new Error("Phone number and code are required"), 400);
//     }

//     const verificationCheck = await client.verify.v2
//       .services(TWILIO_VERIFY_SERVICE_SID!)
//       .verificationChecks.create({ to: phoneNumber, code });

//     if (verificationCheck.status === "approved") {
//       return dataObject({ verified: true }, 200);
//     } else {
//       return dataObject({ verified: false }, 200);
//     }
//   } catch (error) {
//     if (
//       error instanceof Error &&
//       "code" in error &&
//       typeof error.code === "number"
//     ) {
//       if (error.code === 60200) {
//         return errorObject(new Error("Invalid Number"), 400);
//       } else if (error.code === 60202) {
//         return errorObject(new Error("Max check attempts reached"), 400);
//       } else {
//         console.log({ message: error.message, code: error.code });
//         return errorObject(new Error("Failed to verify OTP"), 500);
//       }
//     }

//     console.log({ error });
//     return errorObject(new Error("Failed to verify OTP"), 500);
//   }
// }

import { dataObject, errorObject } from "@/utils";

export const runtime = "edge";

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } =
  process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
  throw new Error("Missing Twilio credentials");
}

export async function POST(request: Request) {
  try {
    const { phoneNumber, code } = await request.json();

    if (!phoneNumber || !code) {
      return errorObject(new Error("Phone number and code are required"), 400);
    }

    const twilioResponse = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        },
        body: new URLSearchParams({
          To: phoneNumber,
          Code: code,
        }),
      }
    );

    if (!twilioResponse.ok) {
      const errorData = await twilioResponse.json();
      if (errorData.code === 60200) {
        return errorObject(new Error("Invalid Number"), 400);
      } else if (errorData.code === 60202) {
        return errorObject(new Error("Max check attempts reached"), 400);
      } else {
        console.log({ message: errorData.message, code: errorData.code });
        return errorObject(new Error("Failed to verify OTP"), 500);
      }
    }

    const verificationCheck = await twilioResponse.json();

    if (verificationCheck.status === "approved") {
      return dataObject({ verified: true }, 200);
    } else {
      return dataObject({ verified: false }, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorObject(new Error("Failed to verify OTP"), 500);
  }
}
