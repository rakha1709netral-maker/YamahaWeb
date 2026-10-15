import java.util.*;

/** Small dependency-free JSON reader/writer for the local server. */
public final class Json {
    private final String text;
    private int pos;
    private Json(String text) { this.text = text; }
    public static Object parse(String text) {
        Json parser = new Json(text);
        Object value = parser.value(0);
        parser.space();
        if (parser.pos != text.length()) throw new IllegalArgumentException("Trailing JSON data");
        return value;
    }
    private void space() { while (pos < text.length() && Character.isWhitespace(text.charAt(pos))) pos++; }
    private char take() { if (pos >= text.length()) throw new IllegalArgumentException("Incomplete JSON"); return text.charAt(pos++); }
    private Object value(int depth) {
        if (depth > 64) throw new IllegalArgumentException("JSON too deep");
        space(); char c = take();
        if (c == '"') return string();
        if (c == '{') {
            Map<String,Object> result = new LinkedHashMap<>(); space();
            if (pos < text.length() && text.charAt(pos) == '}') { pos++; return result; }
            do { space(); if (take() != '"') throw new IllegalArgumentException("Invalid key"); String key = string(); space(); if (take() != ':') throw new IllegalArgumentException("Missing colon"); result.put(key, value(depth+1)); space(); c = take(); if (c == '}') return result; } while (c == ',');
            throw new IllegalArgumentException("Invalid object");
        }
        if (c == '[') {
            List<Object> result = new ArrayList<>(); space();
            if (pos < text.length() && text.charAt(pos) == ']') { pos++; return result; }
            do { result.add(value(depth+1)); space(); c = take(); if (c == ']') return result; } while (c == ',');
            throw new IllegalArgumentException("Invalid array");
        }
        pos--; int start = pos;
        while (pos < text.length() && ",]} \r\n\t".indexOf(text.charAt(pos)) < 0) pos++;
        String token = text.substring(start,pos);
        return switch(token) { case "true" -> true; case "false" -> false; case "null" -> null; default -> { if (!token.matches("-?(0|[1-9][0-9]*)(\\.[0-9]+)?([eE][+-]?[0-9]+)?")) throw new IllegalArgumentException("Invalid JSON value"); yield token.contains(".") || token.contains("e") || token.contains("E") ? Double.valueOf(token) : Long.valueOf(token); } };
    }
    private String string() {
        StringBuilder out = new StringBuilder();
        while (true) { char c = take(); if (c == '"') return out.toString(); if (c < 32) throw new IllegalArgumentException("Invalid string");
            if (c == '\\') { c = take(); switch(c) { case '"', '\\', '/' -> out.append(c); case 'b' -> out.append('\b'); case 'f' -> out.append('\f'); case 'n' -> out.append('\n'); case 'r' -> out.append('\r'); case 't' -> out.append('\t'); case 'u' -> { if (pos+4 > text.length()) throw new IllegalArgumentException("Invalid escape"); out.append((char) Integer.parseInt(text.substring(pos,pos+4),16)); pos += 4; } default -> throw new IllegalArgumentException("Invalid escape"); } } else out.append(c);
        }
    }
    public static String stringify(Object value) {
        if (value == null) return "null";
        if (value instanceof String s) { StringBuilder out = new StringBuilder("\""); for (char c : s.toCharArray()) { switch(c) { case '"' -> out.append("\\\""); case '\\' -> out.append("\\\\"); case '\n' -> out.append("\\n"); case '\r' -> out.append("\\r"); case '\t' -> out.append("\\t"); default -> { if(c < 32) out.append(String.format("\\u%04x",(int)c)); else out.append(c); } } } return out.append('"').toString(); }
        if (value instanceof Number || value instanceof Boolean) return value.toString();
        if (value instanceof Map<?,?> map) { StringJoiner out = new StringJoiner(",","{","}"); map.forEach((k,v) -> out.add(stringify(k.toString())+":"+stringify(v))); return out.toString(); }
        if (value instanceof Iterable<?> list) { StringJoiner out = new StringJoiner(",","[","]"); list.forEach(v -> out.add(stringify(v))); return out.toString(); }
        throw new IllegalArgumentException("Unsupported JSON type");
    }
}
