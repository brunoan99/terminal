parse into -> <Statement \| Stament[] \| OP>[]

parse order <br>
&ensp;&ensp;(inside sub shell)
&ensp;&ensp;operators
&ensp;&ensp;statements

then eval in order

match st { <br>
&ensp;&ensp;Statement => eval <br>
&ensp;&ensp;Statement[] => eval <br>
&ensp;&ensp;Op => check the OP and eval under conditions of the operator <br>
}

parse -> check -> exec
