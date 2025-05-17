import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

export async function strictOutput(
  systemPrompt: string,
  userPrompt: string | string[],
  outputFormat: OutputFormat,
  defaultCategory: string = "",
  outputValueOnly: boolean = false,
  model: string = "gpt-4.1-nano",
  temperature: number = 1,
  attemptCount: number = 3,
  verbose: boolean = false
): Promise<
  {
    question: string;
    answer: string;
  }[]
> {
  // if the user input is in a list, we also process the output as a list of json
  const listInput: boolean = Array.isArray(userPrompt);

  // if the output format contains dynamic elements of < or >, then add to the prompt to handle dynamic elements
  const dynamicElements: boolean = /<.*?>/.test(JSON.stringify(outputFormat));

  // if the output format contains list elements of [ or ], then we add to the prompt to handle lists
  const listOutput: boolean = /\[.*?\]/.test(JSON.stringify(outputFormat));

  // start off with no error message
  let errorMessage: string = "";

  for (let i = 0; i < attemptCount; i++) {
    let outputFormatPrompt: string = `\nYou are to output the following in JSON format: ${JSON.stringify(
      outputFormat
    )}. \nDo not put double quotation marks " " or escape characters \\ in the output fields.`;

    if (listOutput) {
      outputFormatPrompt += `\nIf output field is a list, classify output into the best element of the list.`;
    }

    // if `outputFormat` contains dynamic elements, process it accordingly
    if (dynamicElements) {
      outputFormatPrompt += `\nAny text enclosed by < and > indicates you must generate content to replace it. Example input: Go to <location>, Example output: Go to the garden\nAny output key containing < and > indicates you must generate the key name to replace it. Example input: {'<location>': 'description of location'}, Example output: {school: a place for education}`;
    }

    // if input is in a list format, ask it to generate json in a list
    if (listInput) {
      outputFormatPrompt += `\nGenerate a list of json, one json for each input element.`;
    }

    // use OpenAI to get a response
    const response = await openai.chat.completions.create({
      model: model,
      temperature: temperature,
      messages: [
        {
          role: "system",
          content: systemPrompt + outputFormatPrompt + errorMessage,
        },
        { role: "user", content: userPrompt.toString() },
      ],
    });

    let res: string =
      response.choices[0].message?.content?.replace(/'/g, '"') ?? "";

    // ensure that we don't replace away apostrophes in text
    res = res.replace(/(\w)"(\w)/g, "$1'$2");

    if (verbose) {
      console.log(
        "System prompt:",
        systemPrompt + outputFormatPrompt + errorMessage
      );

      console.log("\nUser prompt:", userPrompt);
      console.log("\nGPT response:", res);
    }

    // try-catch block to ensure output format is adhered to
    try {
      let output: any = JSON.parse(res);

      if (listInput) {
        if (!Array.isArray(output)) {
          throw new Error("Output format not in a list of json");
        }
      } else {
        output = [output];
      }

      // check for each element in the output list, the format is correctly adhered to
      for (let index = 0; index < output.length; index++) {
        for (const key in outputFormat) {
          // unable to ensure accuracy of dynamic output header, so skip it
          if (/<.*?>/.test(key)) {
            continue;
          }

          // if output field missing, raise an error
          if (!(key in output[index])) {
            throw new Error(`${key} not in json output`);
          }

          // check that one of the choices given for the list of words is an unknown
          if (Array.isArray(outputFormat[key])) {
            const choices = outputFormat[key] as string[];

            // ensure output is not a list
            if (Array.isArray(output[index][key])) {
              output[index][key] = output[index][key][0];
            }

            // output the default category (if any) in case of GPT being unable to identify the category
            if (!choices.includes(output[index][key]) && defaultCategory) {
              output[index][key] = defaultCategory;
            }

            // if the output is a description format, get only the label
            if (output[index][key].includes(":")) {
              output[index][key] = output[index][key].split(":")[0];
            }
          }
        }

        // if we just want the values for the outputs
        if (outputValueOnly) {
          output[index] = Object.values(output[index]);

          // just output without the list if there is only one element
          if (output[index].length === 1) {
            output[index] = output[index][0];
          }
        }
      }

      return listInput ? output : output[0];
    } catch (e) {
      errorMessage = `\n\nResult: ${res}\n\nError message: ${e}`;
      console.log("An exception occurred:", e);
      console.log("Current invalid json format:", res);
    }
  }

  return [];
}
