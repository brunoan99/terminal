| command | response | eval |
|--|---|---|
| `(export FOO=bar; env \| grepp "FOO" \|\| echo "123")` | FOO=bar | |
| `(export FOO=bar; env \| grep "BAZ" && echo "123") \|\| echo "234"` | 234 | |
| `(export FOO=bar; env \| grep "BAZ" \|\| echo "123") && echo "234"` | 1234\n234 | |


<table>
<tr>
  <td>
    Command
  </td>
  <td>
    Response
  </td>
  <td>
    Eval
  </td>
</tr>
<tr>
  <td>

  ```sh
  env \| grep "UNEXISTENT" \|\| echo "123"
  ```

  </td>

  <td>

  ```sh
  123
  ```

  </td>
  <td>

  ```json
  [
    { "bin": "env", "arguments": [] }
    ,
    { "op": "|" },
    { "bin": "grep", "arguments": ["UNEXISTENT"] },
    { "op": "||" },
    { "bin": "echo", "arguments": ["123"] }
  ]
  ```

  </td>
</tr>

<tr>
  <td>

  ```sh
  env \| grep "FOO" \|\| echo "123"
  ```

  </td>

  <td>

  ```sh
  FOO=bar
  ```

  </td>
  <td>

  ```json
  [
    { "env": [{"FOO": "bar"}], "bin": "env", "arguments": [] }
    ,
    { "op": "|" },
    { "bin": "grep", "arguments": ["FOO"] },
    { "op": "||" },
    { "bin": "echo", "arguments": ["123"] }
  ]
  ```

  </td>
</tr>

<tr>
  <td>

  ```sh
  echo "123" \|\| echo "234"
  ```

  </td>

  <td>

  ```sh
  123
  ```

  </td>
  <td>

  ```json
  [
    { "bin": "echo", "arguments": ["123"] }
    ,
    { "op": "||" },
    { "bin": "echo", "arguments": ["234"] }
  ]
  ```

  </td>
</tr>

<tr>
  <td>

  ```sh
  echo "123" && echo "234"
  ```

  </td>

  <td>

  ```sh
  123
  234
  ```

  </td>
  <td>

  ```json
  [
    { "bin": "var", "arguments": ["="] }
    ,
    { "op": "&&" },
    { "bin": "export", "arguments": ["234"] }
  ]
  ```

  </td>
</tr>

<tr>
  <td>

  ```sh
  var=test; echo "$var"
  ```

  </td>

  <td>

  ```sh
  test
  ```

  </td>
  <td>

  ```json
  [
    { "bin": "var", "arguments": ["test"] }
    ,
    { "op": ";" },
    { "bin": "echo", "arguments": ["$var"] }
  ]
  ```

  </td>
</tr>

<tr>
  <td>

  ```sh
  var=test; export HOME=home
  ```

  </td>

  <td>

  ```sh
  ```

  </td>
  <td>

  ```json
  [
    { "bin": "var", "arguments": ["test"] }
    ,
    { "op": ";" },
    { "bin": "export", "arguments": ["HOME=home"] }
  ]
  ```

  </td>
</tr>

</table>
