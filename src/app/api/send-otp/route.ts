// import { dataObject, errorObject } from "@/utils";
// import twilio from "twilio";

// const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } =
//   process.env;

// const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// export async function POST(request: Request) {
//   try {
//     const { phoneNumber } = await request.json();

//     if (!phoneNumber)
//       return errorObject(new Error("Phone number is required"), 400);

//     await client.verify.v2
//       .services(TWILIO_VERIFY_SERVICE_SID!)
//       .verifications.create({ to: phoneNumber, channel: "sms" });

//     return dataObject(true, 200);
//   } catch (error) {
//     if (
//       error instanceof Error &&
//       "code" in error &&
//       typeof error.code === "number"
//     ) {
//       if (error.code === 60200) {
//         console.log({ errorCode: error.code });
//         console.log({ errorMessage: error.message });
//         return errorObject(new Error("Invalid Number"), 400);
//       } else if (error.code === 60203) {
//         // max attempt
//         console.log({ errorCode: error.code });
//         console.log({ errorMessage: error.message });
//         return errorObject(new Error(`${error.message}`), 400);
//       } else {
//         console.log({ errorCode: error.code });
//         console.log({ errorMessage: error.message });
//         return errorObject(new Error(`${error.message}`), 500);
//       }
//     }
//     console.log({ error });
//     return errorObject(new Error(`Failed to send OTP`), 500);
//   }
// }

import { dataObject, errorObject } from "@/utils";

// export const runtime = "edge";

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } =
  process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
  throw new Error("Missing Twilio credentials");
}

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();
    console.log({ phoneNumber });

    if (!phoneNumber) {
      return errorObject(new Error("Phone number is required"), 400);
    }

    const twilioResponse = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/Verifications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        },
        body: new URLSearchParams({
          To: phoneNumber,
          Channel: "sms",
        }),
      }
    );

    if (!twilioResponse.ok) {
      const errorData = await twilioResponse.json();
      if (errorData.code === 60200) {
        console.log({ errorCode: errorData.code });
        console.log({ errorMessage: errorData.message });
        return errorObject(new Error("Invalid Number"), 400);
      } else if (errorData.code === 60203) {
        console.log({ errorCode: errorData.code });
        console.log({ errorMessage: errorData.message });
        return errorObject(new Error(errorData.message), 400);
      } else {
        console.log({ errorCode: errorData.code });
        console.log({ errorMessage: errorData.message });
        return errorObject(new Error(errorData.message), 500);
      }
    }

    return dataObject(true, 200);
  } catch (error) {
    console.log({ error });
    return errorObject(new Error(`Failed to send OTP`), 500);
  }
}
