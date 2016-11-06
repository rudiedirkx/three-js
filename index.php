<?php

// get examples -- let's assume all .html files
$files = glob('./*.html');

echo '<ul>';
foreach ( $files AS $file ) {
	$uri = basename($file);
	$name = $uri;

	echo '<li><a href="' . $uri . '">' . $name . '</a></li>';
}
echo '</ul>';


