from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch, os
model_id = os.environ.get("HF_MODEL","microsoft/phi-2")

tok = AutoTokenizer.from_pretrained(model_id, use_auth_token=True)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    device_map="auto",
    use_auth_token=True
)
pipe = pipeline("text-generation", model=model, tokenizer=tok, device_map="auto")
out = pipe("Explain XRPL in two lines:", max_new_tokens=80, do_sample=True, temperature=0.7)
print(out[0]["generated_text"])
